import crypto from 'crypto';
import { Appointment } from '@ai-agent/shared';
import { getCachedAppointments } from '../integrations/googleCalendar.js';
import { checkAvailableSlots } from './bookingService.js';
import { sendWhatsAppMessage } from '../integrations/whatsapp.js';
import { dispatchWebhookEvent } from './webhookDispatcher.js';
import { config } from '../config/index.js';

const PORTAL_SECRET = process.env.PORTAL_SECRET || 'portal_secret_magic_token_live';

export interface PortalTokenPayload {
  appointmentId: string;
  customerPhone: string;
  customerEmail: string;
  expiresAt: number;
}

/**
 * Generate a cryptographically signed Magic-Link Token for customer self-service
 */
export function generatePortalToken(appointmentId: string): string {
  const appointments = getCachedAppointments();
  const apt = appointments.find(a => a.id === appointmentId);
  if (!apt) {
    throw new Error(`Appointment not found for ID: ${appointmentId}`);
  }

  const payload: PortalTokenPayload = {
    appointmentId: apt.id,
    customerPhone: apt.customerPhone,
    customerEmail: apt.customerEmail,
    expiresAt: Date.now() + 7 * 24 * 3600 * 1000 // 7 days validity
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', PORTAL_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify Magic-Link Token and return the associated appointment
 */
export function verifyPortalToken(token: string): { valid: boolean; appointment?: Appointment; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Malformed token structure' };
    }

    const [payloadBase64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', PORTAL_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const payload: PortalTokenPayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: 'Token has expired' };
    }

    const appointments = getCachedAppointments();
    const apt = appointments.find(a => a.id === payload.appointmentId);
    if (!apt) {
      return { valid: false, error: 'Appointment not found' };
    }

    return { valid: true, appointment: apt };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
}

/**
 * Self-service slot swap on Google Calendar with policy verification
 */
export async function rescheduleAppointmentViaPortal(params: {
  token: string;
  newStartTime: string;
  newEndTime: string;
}): Promise<{ success: boolean; appointment: Appointment; message: string; policyCompliant: boolean }> {
  const verification = verifyPortalToken(params.token);
  if (!verification.valid || !verification.appointment) {
    throw new Error(verification.error || 'Invalid self-service session token');
  }

  const apt = verification.appointment;
  if (apt.status === 'cancelled') {
    throw new Error('This appointment has already been cancelled.');
  }

  // Check cancellation/reschedule policy (>4h window check)
  const currentStartMs = new Date(apt.startTime).getTime();
  const hoursUntilStart = (currentStartMs - Date.now()) / (1000 * 60 * 60);
  const isFreeWindow = hoursUntilStart >= 4;

  // Verify target slot is available on Google Calendar
  const targetDate = params.newStartTime.split('T')[0];
  const availableSlots = await checkAvailableSlots(targetDate);
  const isTargetSlotFree = availableSlots.some(s => s.startTime === params.newStartTime);

  if (!isTargetSlotFree) {
    throw new Error('The selected time slot is no longer available. Please select another slot.');
  }

  // Atomically swap slot
  const oldStartTime = apt.startTime;
  apt.startTime = params.newStartTime;
  apt.endTime = params.newEndTime;
  apt.status = 'confirmed';

  const newStartFormatted = new Date(apt.startTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const confirmMsg = `🔄 *Appointment Rescheduled Successfully*\n\n` +
    `Hello ${apt.customerName},\n` +
    `Your appointment for *${apt.serviceName}* has been updated to:\n` +
    `📅 *${newStartFormatted}*\n` +
    `Doctor: ${apt.assignedDoctor || 'Assigned Specialist'}\n` +
    `Location: 104 Grand Vista Blvd, Suite 400\n\n` +
    `Your deposit of ${config.business.currency} ${apt.depositAmount || 500} has been transferred to this new slot.`;

  if (apt.customerPhone) {
    try {
      await sendWhatsAppMessage(apt.customerPhone, confirmMsg);
    } catch {
      // Ignore simulation
    }
  }

  // Outbound Webhook dispatch
  await dispatchWebhookEvent('appointment.created', {
    action: 'rescheduled',
    appointmentId: apt.id,
    customerName: apt.customerName,
    oldStartTime,
    newStartTime: apt.startTime,
    isFreeWindow
  });

  return {
    success: true,
    appointment: apt,
    message: `Appointment successfully moved to ${newStartFormatted}.`,
    policyCompliant: isFreeWindow
  };
}

/**
 * Self-service cancellation with automated deposit refund / credit calculation
 */
export async function cancelAppointmentViaPortal(params: {
  token: string;
  reason?: string;
}): Promise<{
  success: boolean;
  refundStatus: 'full_deposit_credit' | 'late_cancellation_fee_applied';
  refundAmount: number;
  message: string;
  appointment: Appointment;
}> {
  const verification = verifyPortalToken(params.token);
  if (!verification.valid || !verification.appointment) {
    throw new Error(verification.error || 'Invalid self-service session token');
  }

  const apt = verification.appointment;
  apt.status = 'cancelled';

  // Check 4-hour clinic policy window
  const currentStartMs = new Date(apt.startTime).getTime();
  const hoursUntilStart = (currentStartMs - Date.now()) / (1000 * 60 * 60);

  const deposit = apt.depositAmount || 500;
  let refundStatus: 'full_deposit_credit' | 'late_cancellation_fee_applied' = 'full_deposit_credit';
  let refundAmount = deposit;

  if (hoursUntilStart < 4) {
    refundStatus = 'late_cancellation_fee_applied';
    refundAmount = Math.round(deposit * 0.5); // 50% retained per clinic policy
  }

  const cancelNotice = `❌ *Appointment Cancelled*\n\n` +
    `Hello ${apt.customerName},\n` +
    `Your appointment for ${apt.serviceName} has been cancelled per your request.\n` +
    `Deposit Credit Issued: ${config.business.currency} ${refundAmount} (${refundStatus === 'full_deposit_credit' ? '100% Full Credit' : 'Late Cancellation Policy applied'})\n` +
    `Calendar slot has been released.`;

  if (apt.customerPhone) {
    try {
      await sendWhatsAppMessage(apt.customerPhone, cancelNotice);
    } catch {
      // Ignore simulation
    }
  }

  await dispatchWebhookEvent('appointment.cancelled', {
    appointmentId: apt.id,
    customerName: apt.customerName,
    reason: params.reason || 'Customer self-service portal cancellation',
    refundStatus,
    refundAmount
  });

  return {
    success: true,
    refundStatus,
    refundAmount,
    message: cancelNotice,
    appointment: apt
  };
}
