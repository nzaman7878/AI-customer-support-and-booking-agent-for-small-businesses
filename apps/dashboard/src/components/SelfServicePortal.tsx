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
          throw new Error(tokenData.error || 'Failed to generate self-service link');
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
        throw new Error(verifyData.error || 'Verification link expired or invalid.');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Unable to load appointment schedule' });
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

  // 4. Handle Slot Reschedule
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
          text: `Slot updated! Your consultation has been rescheduled to ${new Date(selectedSlot.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}. Confirmation notification sent.`
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
          text: `Appointment cancelled and calendar slot released. Credit: INR ${data.refundAmount} (${data.refundStatus}).`
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
    <div className={`bg-white border border-[#E5DFD5] rounded-xl w-full ${isStandalone ? 'max-w-2xl' : 'max-w-2xl max-h-[92vh]'} flex flex-col shadow-xl overflow-hidden font-sans`}>
      
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-[#E5DFD5] flex items-center justify-between bg-[#FBF9F5]">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-[#EBF2EE] border border-[#D5E2DB] flex items-center justify-center text-[#1E3A2F]">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif-display font-semibold text-[#1C1917] text-base">Patient Scheduling Portal</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF5EE] text-[#1B4332] border border-[#C6E7D2] font-mono">
                Verified Link
              </span>
            </div>
            <p className="text-xs text-[#78716C]">Self-service consultation rescheduling and appointment records</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE8] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Modal / Card Body */}
      <div className="p-6 space-y-5 overflow-y-auto">
        {loading ? (
          <div className="space-y-4 py-6">
            <div className="skeleton-shimmer h-12 w-full rounded-lg" />
            <div className="skeleton-shimmer h-24 w-full rounded-lg" />
            <div className="skeleton-shimmer h-32 w-full rounded-lg" />
          </div>
        ) : (
          <>
            {/* Status Alert Toast */}
            {statusMessage && (
              <div className={`p-3.5 rounded-lg border text-xs flex items-center space-x-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-[#EAF5EE] border-[#C6E7D2] text-[#1B4332]'
                  : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
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
                <div className="h-10 w-10 rounded-lg bg-[#EBF2EE] border border-[#D5E2DB] flex items-center justify-center text-[#1E3A2F]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-serif-display font-semibold text-[#1C1917] text-base">Lookup Appointment</h4>
                  <p className="text-xs text-[#78716C] mt-1 max-w-md">
                    Enter the booking reference ID (e.g. <code>apt_seed_1</code>) or magic link token sent to your WhatsApp or email.
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
                    placeholder="e.g. apt_seed_1"
                    className="flex-1 input-clinic text-xs py-2 px-3"
                  />
                  <button
                    type="submit"
                    disabled={!manualInput.trim()}
                    className="btn-clinic-primary text-xs py-2 px-4 cursor-pointer disabled:opacity-40"
                  >
                    Lookup
                  </button>
                </form>
              </div>
            )}

            {/* Active Appointment Summary Card */}
            {appointment && (
              <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                    Current Reservation
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    appointment.status === 'cancelled'
                      ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
                      : 'bg-[#EAF5EE] text-[#1B4332] border border-[#C6E7D2]'
                  }`}>
                    {appointment.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[#78716C] text-[11px]">Patient Name</div>
                    <div className="text-[#1C1917] font-medium flex items-center space-x-1.5 mt-0.5">
                      <User className="h-3.5 w-3.5 text-[#1E3A2F]" />
                      <span>{appointment.customerName}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[#78716C] text-[11px]">Treatment & Protocol</div>
                    <div className="text-[#1C1917] font-medium mt-0.5">{appointment.serviceName}</div>
                  </div>
                  <div>
                    <div className="text-[#78716C] text-[11px]">Current Slot (IST)</div>
                    <div className="text-[#1E3A2F] font-mono font-medium mt-0.5 flex items-center space-x-1.5">
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
                    <div className="text-[#78716C] text-[11px]">Deposit Status</div>
                    <div className="text-[#1B4332] font-mono font-medium mt-0.5 flex items-center space-x-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>INR {appointment.depositAmount || 500} Paid</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5DFD5] flex items-center text-[11px] text-[#78716C] space-x-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#1E3A2F]" />
                  <span>Apex Wellness Clinic • 104 Grand Vista Blvd, Suite 400</span>
                </div>
              </div>
            )}

            {/* Clinic Policy Indicator */}
            {policy && (
              <div className="p-3.5 rounded-lg border border-[#E5DFD5] bg-white text-xs flex items-start space-x-3">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-[#1E3A2F]" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-[#1C1917] flex items-center space-x-2">
                    <span>Reschedule & Notice Terms</span>
                    <span className="text-[10px] font-mono text-[#78716C]">
                      ({policy.hoursUntilStart > 0 ? `${policy.hoursUntilStart}h notice` : 'Immediate'})
                    </span>
                  </div>
                  <p className="text-[11px] text-[#44403C] leading-relaxed">{policy.policySummary}</p>
                </div>
              </div>
            )}

            {/* Slot Rescheduling Section */}
            {appointment && appointment.status !== 'cancelled' && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-[#1C1917] flex items-center space-x-2">
                      <span>Choose New Slot</span>
                      <span className="text-[10px] font-mono font-normal text-[#1B4332] bg-[#EAF5EE] px-2 py-0.5 rounded">
                        {availableSlots.length} available
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#78716C]">Select a date and click an available time slot.</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-[#78716C]">Date:</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="input-clinic text-xs py-1 px-2.5"
                    />
                  </div>
                </div>

                {/* Slot Grid with Shimmer Skeleton */}
                {loadingSlots ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3">
                    <div className="skeleton-shimmer h-12 rounded-lg" />
                    <div className="skeleton-shimmer h-12 rounded-lg" />
                    <div className="skeleton-shimmer h-12 rounded-lg" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#78716C] bg-[#FAF7F2] border border-[#E5DFD5] rounded-lg">
                    No open consultation slots found for this date. Please select another day.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-lg border text-left transition text-xs flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                              : 'bg-white border-[#E5DFD5] text-[#1C1917] hover:border-[#1E3A2F]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-mono font-semibold">{slot.displayTime}</span>
                            {isSelected ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-[#78716C]" />
                            )}
                          </div>
                          <span className={`text-[10px] mt-1 truncate ${isSelected ? 'text-white/80' : 'text-[#78716C]'}`}>
                            {slot.assignedDoctor}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Confirm Reschedule Action Strip */}
                {selectedSlot && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF7F2] p-3 rounded-lg border border-[#E5DFD5]">
                    <div className="text-xs">
                      <span className="text-[#78716C]">Selected slot: </span>
                      <span className="text-[#1E3A2F] font-mono font-semibold">
                        {selectedSlot.displayTime} ({selectedDate})
                      </span>
                      <div className="text-[10px] text-[#1B4332]">100% deposit carried forward</div>
                    </div>
                    <button
                      onClick={handleReschedule}
                      disabled={rescheduling}
                      className="btn-clinic-primary text-xs py-2 px-4 cursor-pointer disabled:opacity-50"
                    >
                      {rescheduling ? 'Updating calendar...' : 'Confirm slot change'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cancellation Section */}
            {appointment && appointment.status !== 'cancelled' && (
              <div className="pt-3 border-t border-[#E5DFD5]">
                {!showCancelConfirm ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#78716C]">Need to cancel completely?</span>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="text-xs text-[#991B1B] hover:underline cursor-pointer"
                    >
                      Cancel booking
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#991B1B] flex items-center space-x-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Confirm Appointment Cancellation</span>
                      </span>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="text-[11px] text-[#78716C] hover:text-[#1C1917]"
                      >
                        Keep booking
                      </button>
                    </div>

                    <p className="text-[11px] text-[#44403C]">
                      Cancelling releases your scheduled calendar slot. A credit of{' '}
                      <span className="font-mono font-bold text-[#1C1917]">
                        INR {policy?.isFreeWindow ? (appointment.depositAmount || 500) : Math.round((appointment.depositAmount || 500) * 0.5)}
                      </span>{' '}
                      will be registered to your clinic account.
                    </p>

                    <div className="space-y-1">
                      <label className="text-[11px] text-[#78716C]">Reason for cancellation:</label>
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full input-clinic text-xs py-1.5 px-2.5"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="btn-clinic-secondary text-xs py-1 px-3"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="btn-clinic-urgent text-xs py-1 px-3 disabled:opacity-50"
                      >
                        {cancelling ? 'Releasing slot...' : 'Confirm & release slot'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shareable Link Strip */}
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 overflow-hidden mr-2">
                <ExternalLink className="h-3.5 w-3.5 text-[#1E3A2F] shrink-0" />
                <span className="text-[#78716C] truncate text-[11px]">
                  Self-service portal URL
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="btn-clinic-secondary text-[11px] py-1 px-2.5 flex items-center space-x-1 shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3 w-3 text-[#1B4332]" />
                    <span className="text-[#1B4332]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#E5DFD5] bg-[#FAF7F2] flex items-center justify-between text-xs text-[#78716C]">
        <span className="text-[11px]">Apex Wellness Encrypted Portal</span>
        {onClose && (
          <button
            onClick={onClose}
            className="btn-clinic-secondary text-xs py-1 px-3 cursor-pointer"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/40 backdrop-blur-xs animate-in fade-in duration-200">
      {portalCard}
    </div>
  );
};

export default SelfServicePortal;
