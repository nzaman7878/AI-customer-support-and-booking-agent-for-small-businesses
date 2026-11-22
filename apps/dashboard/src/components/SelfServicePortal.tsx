import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  User,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import { Appointment } from '@ai-agent/shared';

interface SelfServicePortalProps {
  appointmentId?: string;
  token?: string;
  isStandalone?: boolean;
  initialAppointment?: Appointment;
  onClose?: () => void;
  onAppointmentUpdated?: () => void;
}

interface CalendarSlot {
  startTime: string;
  endTime: string;
  displayTime: string;
  isAvailable: boolean;
  assignedDoctor: string;
}

interface PolicyInfo {
  hoursUntilStart: number;
  isFreeWindow: boolean;
  freeReschedule: boolean;
  refundPercentage: number;
  policySummary: string;
}

export const SelfServicePortal: React.FC<SelfServicePortalProps> = ({
  appointmentId,
  token: tokenProp,
  isStandalone = false,
  initialAppointment,
  onClose,
  onAppointmentUpdated
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string>(tokenProp || '');
  const [appointment, setAppointment] = useState<Appointment | null>(initialAppointment || null);
  const [policy, setPolicy] = useState<PolicyInfo | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // default to tomorrow
    return today.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<CalendarSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [rescheduling, setRescheduling] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Personal schedule conflict');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // 1. Initialize Portal Session Token
  const initPortal = async (explicitToken?: string, explicitAptId?: string) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      let activeToken = explicitToken || tokenProp || '';
      const targetAptId = explicitAptId || appointmentId;

      if (!activeToken && targetAptId) {
        const tokenRes = await fetch(`/api/portal/token/${targetAptId}`);
        const tokenData = await tokenRes.json();

        if (!tokenData.success || !tokenData.token) {
          throw new Error(tokenData.error || 'Failed to generate self-service token');
        }
        activeToken = tokenData.token;
      }

      if (!activeToken) {
        setLoading(false);
        return;
      }

      setToken(activeToken);

      // 2. Verify and load live appointment + policy
      const verifyRes = await fetch(`/api/portal/verify?token=${encodeURIComponent(activeToken)}`);
      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        setAppointment(verifyData.appointment);
        setPolicy(verifyData.policy);
      } else {
        throw new Error(verifyData.error || 'Portal verification failed. Link may be invalid or expired.');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error initializing portal' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenProp || appointmentId) {
      initPortal(tokenProp, appointmentId);
    } else {
      setLoading(false);
    }
  }, [tokenProp, appointmentId]);

  // 3. Load Available Slots when selectedDate or token changes
  useEffect(() => {
    async function fetchSlots() {
      if (!token || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/portal/slots?token=${encodeURIComponent(token)}&date=${selectedDate}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.slots)) {
          setAvailableSlots(data.slots.filter((s: CalendarSlot) => s.isAvailable));
        }
      } catch (err) {
        console.error('Error fetching portal slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [token, selectedDate]);

  // 4. Handle 1-Click Slot Reschedule
  const handleReschedule = async () => {
    if (!token || !selectedSlot) return;
    setRescheduling(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/portal/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newStartTime: selectedSlot.startTime,
          newEndTime: selectedSlot.endTime
        })
      });
      const data = await res.json();

      if (data.success) {
        setAppointment(data.appointment);
        setStatusMessage({
          type: 'success',
          text: `Slot updated! Your appointment has been moved to ${new Date(selectedSlot.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}. Confirmation notification sent.`
        });
        setSelectedSlot(null);
        if (onAppointmentUpdated) onAppointmentUpdated();
      } else {
        throw new Error(data.error || 'Failed to reschedule appointment');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Rescheduling error' });
    } finally {
      setRescheduling(false);
    }
  };

  // 5. Handle Cancellation
  const handleCancel = async () => {
    if (!token) return;
    setCancelling(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/portal/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          reason: cancelReason
        })
      });
      const data = await res.json();

      if (data.success) {
        setAppointment(data.appointment);
        setShowCancelConfirm(false);
        setStatusMessage({
          type: 'success',
          text: `Appointment cancelled. Calendar slot released. Refund / Deposit Credit: INR ${data.refundAmount} (${data.refundStatus}).`
        });
        if (onAppointmentUpdated) onAppointmentUpdated();
      } else {
        throw new Error(data.error || 'Failed to cancel appointment');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Cancellation error' });
    } finally {
      setCancelling(false);
    }
  };

  // 6. Copy Magic Link
  const handleCopyLink = () => {
    if (!token) return;
    const url = `${window.location.origin}/portal?token=${encodeURIComponent(token)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const portalCard = (
    <div className={`bg-[#0b0f19] border border-[#1e293b] rounded-2xl w-full ${isStandalone ? 'max-w-2xl' : 'max-w-2xl max-h-[92vh]'} flex flex-col shadow-2xl overflow-hidden`}>
      
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0f172a]/60">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 flex items-center justify-center text-[#818cf8]">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-white text-sm sm:text-base">Client Self-Service Portal</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30 font-mono">
                Magic-Link Verified
              </span>
            </div>
            <p className="text-[11px] text-[#908fa0]">1-Click Slot Rescheduling & Self-Service Management</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#908fa0] hover:text-white hover:bg-[#1e293b] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Modal / Card Body */}
      <div className="p-6 space-y-6 overflow-y-auto">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="h-7 w-7 text-[#818cf8] animate-spin" />
            <p className="text-xs text-[#908fa0]">Decrypting magic-link session token & calendar state...</p>
          </div>
        ) : (
          <>
            {/* Status Alert Toast */}
            {statusMessage && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-[#10b981]/15 border-[#10b981]/40 text-[#4edea3]'
                  : 'bg-[#f43f5e]/15 border-[#f43f5e]/40 text-[#ffb4ab]'
              }`}>
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {!appointment && (
              <div className="py-8 px-4 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="h-12 w-12 rounded-2xl bg-[#6366f1]/15 border border-[#6366f1]/30 flex items-center justify-center text-[#818cf8]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Client Self-Service Verification</h4>
                  <p className="text-xs text-[#908fa0] mt-1 max-w-md">
                    Enter the secure magic-link token or appointment reference ID (e.g. <code>apt_seed_1</code>) sent to your WhatsApp or SMS to manage your booking.
                  </p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualInput.trim()) {
                      if (manualInput.startsWith('eyJ')) {
                        initPortal(manualInput.trim(), undefined);
                      } else {
                        initPortal(undefined, manualInput.trim());
                      }
                    }
                  }}
                  className="w-full max-w-md flex space-x-2"
                >
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Paste token or appointment ID..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#030712] border border-[#1e293b] text-xs text-white placeholder-[#908fa0] focus:border-[#6366f1] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!manualInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    Verify
                  </button>
                </form>
              </div>
            )}

              {/* Active Appointment Summary Card */}
              {appointment && (
                <div className="p-4 rounded-xl bg-[#030712] border border-[#1e293b] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#818cf8] uppercase tracking-wider">
                      Current Booking Details
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono ${
                      appointment.status === 'cancelled'
                        ? 'bg-[#f43f5e]/15 text-[#ffb4ab] border border-[#f43f5e]/30'
                        : 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30'
                    }`}>
                      {appointment.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-[#908fa0] text-[11px]">Client Name</div>
                      <div className="text-white font-medium flex items-center space-x-1.5 mt-0.5">
                        <User className="h-3.5 w-3.5 text-[#818cf8]" />
                        <span>{appointment.customerName}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[#908fa0] text-[11px]">Booked Service</div>
                      <div className="text-white font-medium mt-0.5">{appointment.serviceName}</div>
                    </div>
                    <div>
                      <div className="text-[#908fa0] text-[11px]">Current Slot (IST)</div>
                      <div className="text-[#818cf8] font-mono font-medium mt-0.5 flex items-center space-x-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {new Date(appointment.startTime).toLocaleString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[#908fa0] text-[11px]">Deposit Status</div>
                      <div className="text-[#10b981] font-mono font-medium mt-0.5 flex items-center space-x-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>INR {appointment.depositAmount || 500} Paid (Active)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1e293b]/60 flex items-center text-[11px] text-[#908fa0] space-x-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#6366f1]" />
                    <span>Apex Wellness Clinic • 104 Grand Vista Blvd, Suite 400</span>
                  </div>
                </div>
              )}

              {/* Clinic Policy Indicator */}
              {policy && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start space-x-3 ${
                  policy.isFreeWindow
                    ? 'bg-[#6366f1]/10 border-[#6366f1]/30 text-[#dfe2f1]'
                    : 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#fde68a]'
                }`}>
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-[#818cf8]" />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white flex items-center space-x-2">
                      <span>Reschedule & Cancellation Policy</span>
                      <span className="text-[10px] font-mono text-[#818cf8]">
                        ({policy.hoursUntilStart > 0 ? `${policy.hoursUntilStart}h notice` : 'Past/Immediate'})
                      </span>
                    </div>
                    <p className="text-[11px] text-[#908fa0]">{policy.policySummary}</p>
                  </div>
                </div>
              )}

              {/* Slot Rescheduling Section */}
              {appointment && appointment.status !== 'cancelled' && (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                        <span>Select New Calendar Slot</span>
                        <span className="text-[10px] font-mono font-normal text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 rounded">
                          {availableSlots.length} Slots Open
                        </span>
                      </h4>
                      <p className="text-[11px] text-[#908fa0]">Choose an available date and time to instantly swap your slot.</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-[#908fa0]">Date:</span>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-[#030712] border border-[#1e293b] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#6366f1]"
                      />
                    </div>
                  </div>

                  {/* Slot Grid */}
                  {loadingSlots ? (
                    <div className="py-8 flex items-center justify-center space-x-2 text-xs text-[#908fa0]">
                      <RefreshCw className="h-4 w-4 animate-spin text-[#818cf8]" />
                      <span>Checking Google Calendar real-time free/busy...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#908fa0] bg-[#030712]/50 border border-[#1e293b] rounded-xl">
                      No open slots found for this date. Please select another date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlot?.startTime === slot.startTime;
                        return (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2.5 rounded-xl border text-left transition text-xs flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-[#6366f1]/20 border-[#6366f1] text-white shadow-md shadow-[#6366f1]/20'
                                : 'bg-[#0f172a] border-[#1e293b] text-[#dfe2f1] hover:border-[#6366f1]/50 hover:bg-[#1e293b]/40'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-mono font-semibold text-white">{slot.displayTime}</span>
                              {isSelected ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-[#908fa0]" />
                              )}
                            </div>
                            <span className="text-[10px] text-[#908fa0] mt-1 truncate">{slot.assignedDoctor}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Confirm Reschedule Button */}
                  {selectedSlot && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#030712] p-3 rounded-xl border border-[#1e293b]">
                      <div className="text-xs">
                        <span className="text-[#908fa0]">Target Slot: </span>
                        <span className="text-[#818cf8] font-mono font-semibold">
                          {selectedSlot.displayTime} ({selectedDate})
                        </span>
                        <div className="text-[10px] text-[#10b981]">100% Deposit Carried Over • No Hidden Fees</div>
                      </div>
                      <button
                        onClick={handleReschedule}
                        disabled={rescheduling}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white text-xs font-semibold hover:opacity-95 transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-[#6366f1]/20 disabled:opacity-50"
                      >
                        {rescheduling ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Updating Calendar...</span>
                          </>
                        ) : (
                          <>
                            <span>Confirm 1-Click Swap</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Cancellation Section */}
              {appointment && appointment.status !== 'cancelled' && (
                <div className="pt-4 border-t border-[#1e293b]/80">
                  {!showCancelConfirm ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#908fa0]">Unable to make it to any available slot?</span>
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="text-xs text-[#ffb4ab] hover:underline cursor-pointer"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#ffb4ab] flex items-center space-x-1.5">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Confirm Cancellation & Deposit Credit</span>
                        </span>
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          className="text-[11px] text-[#908fa0] hover:text-white"
                        >
                          Dismiss
                        </button>
                      </div>

                      <p className="text-[11px] text-[#dfe2f1]">
                        Cancelling releases your reserved slot. Per policy, a credit of{' '}
                        <span className="font-mono font-bold text-white">
                          INR {policy?.isFreeWindow ? (appointment.depositAmount || 500) : Math.round((appointment.depositAmount || 500) * 0.5)}
                        </span>{' '}
                        will be automatically registered on your account.
                      </p>

                      <div className="space-y-1.5">
                        <label className="text-[11px] text-[#908fa0]">Reason for cancellation:</label>
                        <input
                          type="text"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-full bg-[#030712] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#f43f5e]"
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          className="px-3 py-1.5 rounded-lg border border-[#1e293b] text-xs text-[#908fa0] hover:text-white cursor-pointer"
                        >
                          Keep Slot
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={cancelling}
                          className="px-3.5 py-1.5 rounded-lg bg-[#f43f5e] hover:bg-[#e11d48] text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          {cancelling ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span>Processing Credit...</span>
                            </>
                          ) : (
                            <span>Confirm & Release Slot</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Shareable Magic Link Drawer */}
              <div className="p-3 rounded-xl bg-[#030712] border border-[#1e293b] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 overflow-hidden mr-2">
                  <ExternalLink className="h-3.5 w-3.5 text-[#818cf8] shrink-0" />
                  <span className="text-[#908fa0] truncate text-[11px]">
                    Magic Link: {token ? `${window.location.origin}/portal?token=${token.slice(0, 16)}...` : 'Generating...'}
                  </span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg bg-[#1e293b] text-[#dfe2f1] hover:text-white text-[11px] flex items-center space-x-1 shrink-0 cursor-pointer transition"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3 w-3 text-[#10b981]" />
                      <span className="text-[#10b981]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Client URL</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1e293b] bg-[#0f172a]/60 flex items-center justify-between text-xs text-[#908fa0]">
          <span className="text-[11px]">HMAC-SHA256 Encrypted Magic Portal</span>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#1e293b] text-white text-xs hover:bg-[#334155] transition cursor-pointer"
            >
              Close
            </button>
          )}
        </div>

      </div>
  );

  if (isStandalone) {
    return portalCard;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {portalCard}
    </div>
  );
};

export default SelfServicePortal;
