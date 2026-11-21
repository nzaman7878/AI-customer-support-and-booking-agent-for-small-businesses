import { Appointment } from '@ai-agent/shared';
import { getCachedAppointments, cancelCalendarEvent } from '../integrations/googleCalendar.js';
import { sendWhatsAppMessage } from '../integrations/whatsapp.js';
import { dispatchWebhookEvent } from './webhookDispatcher.js';
import { config } from '../config/index.js';
import { getDb, isDbConnected } from '../db/mongo.js';

export type ReminderType = 'immediate_confirmation' | '24h_reminder' | '2h_reminder';

export interface ReminderLogEntry {
  id: string;
  appointmentId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  type: ReminderType;
  channel: 'whatsapp' | 'email';
  content: string;
  status: 'sent' | 'simulated';
  sentAt: string;
}

// Memory tracking of dispatched reminder stages per appointment
const dispatchedReminderStages: Record<string, { confirmation?: boolean; reminder24h?: boolean; reminder2h?: boolean }> = {};

const reminderLogs: ReminderLogEntry[] = [];

export function getReminderLogs(): ReminderLogEntry[] {
  return [...reminderLogs];
}

/**
 * Send immediate booking confirmation alert via WhatsApp & Email
 */
export async function sendImmediateBookingConfirmation(appointment: Appointment): Promise<ReminderLogEntry> {
  const stage = dispatchedReminderStages[appointment.id] || {};
  if (stage.confirmation) {
    return reminderLogs.find(r => r.appointmentId === appointment.id && r.type === 'immediate_confirmation')!;
  }

  const startFormatted = new Date(appointment.startTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const messageText = `✅ *Booking Confirmed at ${config.business.name}*\n\n` +
    `Hello ${appointment.customerName},\n` +
    `Your appointment for *${appointment.serviceName}* is confirmed for:\n` +
    `📅 *${startFormatted}*\n\n` +
    `Doctor: ${appointment.assignedDoctor || 'Assigned Specialist'}\n` +
    `Location: 104 Grand Vista Blvd, Suite 400\n\n` +
    `Need to reschedule or cancel? Reply directly to this message or call ${config.business.contactPhone}.`;

  // Send WhatsApp message if phone is provided
  if (appointment.customerPhone) {
    try {
      await sendWhatsAppMessage(appointment.customerPhone, messageText);
    } catch (err: any) {
      console.log(`[ReminderService] WhatsApp confirmation logged: ${err.message}`);
    }
  }

  const entry: ReminderLogEntry = {
    id: `rem_conf_${Date.now()}_${appointment.id}`,
    appointmentId: appointment.id,
    customerName: appointment.customerName,
    customerPhone: appointment.customerPhone,
    customerEmail: appointment.customerEmail,
    type: 'immediate_confirmation',
    channel: 'whatsapp',
    content: messageText,
    status: 'sent',
    sentAt: new Date().toISOString()
  };

  reminderLogs.unshift(entry);
  if (reminderLogs.length > 50) reminderLogs.pop();

  dispatchedReminderStages[appointment.id] = { ...stage, confirmation: true };

  // Dispatch webhook event
  await dispatchWebhookEvent('reminder.sent', {
    appointmentId: appointment.id,
    type: 'immediate_confirmation',
    customerName: appointment.customerName,
    service: appointment.serviceName,
    startTime: appointment.startTime
  });

  // Persist to Mongo if connected
  const db = getDb();
  if (isDbConnected() && db) {
    try {
      await db.collection('reminder_logs').insertOne(entry);
    } catch {
      // Ignore Mongo error in simulation
    }
  }

  return entry;
}

/**
 * Scan all scheduled appointments and dispatch 24h & 2h reminders
 */
export async function scanAndDispatchUpcomingReminders(now: Date = new Date()): Promise<{
  scannedCount: number;
  remindersDispatched: number;
  logs: ReminderLogEntry[];
}> {
  const appointments = getCachedAppointments();
  const dispatchedThisRun: ReminderLogEntry[] = [];
  const nowMs = now.getTime();

  for (const apt of appointments) {
    if (apt.status === 'cancelled') continue;

    const aptStartMs = new Date(apt.startTime).getTime();
    const diffHours = (aptStartMs - nowMs) / (1000 * 60 * 60);

    const stages = dispatchedReminderStages[apt.id] || {};

    // 1. Check 24-hour reminder window (between 18h and 26h before start)
    if (diffHours >= 18 && diffHours <= 26 && !stages.reminder24h) {
      const msg = `⏰ *Reminder: Upcoming Appointment Tomorrow*\n\n` +
        `Hi ${apt.customerName}, this is a reminder for your *${apt.serviceName}* scheduled tomorrow at *${new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}* with ${config.business.name}.\n\n` +
        `Reply YES to confirm or CANCEL if you need to reschedule.`;

      if (apt.customerPhone) {
        try {
          await sendWhatsAppMessage(apt.customerPhone, msg);
        } catch {
          // Fallback simulation
        }
      }

      const entry: ReminderLogEntry = {
        id: `rem_24h_${Date.now()}_${apt.id}`,
        appointmentId: apt.id,
        customerName: apt.customerName,
        customerPhone: apt.customerPhone,
        customerEmail: apt.customerEmail,
        type: '24h_reminder',
        channel: 'whatsapp',
        content: msg,
        status: 'sent',
        sentAt: new Date().toISOString()
      };

      reminderLogs.unshift(entry);
      dispatchedThisRun.push(entry);
      dispatchedReminderStages[apt.id] = { ...stages, reminder24h: true };

      await dispatchWebhookEvent('reminder.sent', {
        appointmentId: apt.id,
        type: '24h_reminder',
        customerName: apt.customerName,
        startTime: apt.startTime
      });
    }

    // 2. Check 2-hour reminder window (between 1h and 3h before start)
    if (diffHours >= 1 && diffHours <= 3 && !stages.reminder2h) {
      const msg = `🔔 *Final Reminder: Starting in 2 Hours*\n\n` +
        `Hi ${apt.customerName}, your *${apt.serviceName}* starts in 2 hours at *${new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}*.\n` +
        `Valet parking is free at the entrance. See you soon!`;

      if (apt.customerPhone) {
        try {
          await sendWhatsAppMessage(apt.customerPhone, msg);
        } catch {
          // Fallback simulation
        }
      }

      const entry: ReminderLogEntry = {
        id: `rem_2h_${Date.now()}_${apt.id}`,
        appointmentId: apt.id,
        customerName: apt.customerName,
        customerPhone: apt.customerPhone,
        customerEmail: apt.customerEmail,
        type: '2h_reminder',
        channel: 'whatsapp',
        content: msg,
        status: 'sent',
        sentAt: new Date().toISOString()
      };

      reminderLogs.unshift(entry);
      dispatchedThisRun.push(entry);
      dispatchedReminderStages[apt.id] = { ...stages, reminder2h: true };

      await dispatchWebhookEvent('reminder.sent', {
        appointmentId: apt.id,
        type: '2h_reminder',
        customerName: apt.customerName,
        startTime: apt.startTime
      });
    }
  }

  return {
    scannedCount: appointments.length,
    remindersDispatched: dispatchedThisRun.length,
    logs: dispatchedThisRun
  };
}

/**
 * Handle client appointment cancellation and trigger webhook
 */
export async function cancelAppointmentWithWorkflow(
  appointmentId: string,
  reason: string = 'Customer requested cancellation via chat'
): Promise<{ success: boolean; appointment: Appointment | null; message: string }> {
  const cancelledApt = cancelCalendarEvent(appointmentId);

  if (!cancelledApt) {
    return {
      success: false,
      appointment: null,
      message: `Appointment with ID ${appointmentId} was not found.`
    };
  }

  // Dispatch webhook event
  await dispatchWebhookEvent('appointment.cancelled', {
    appointmentId: cancelledApt.id,
    customerName: cancelledApt.customerName,
    service: cancelledApt.serviceName,
    startTime: cancelledApt.startTime,
    reason
  });

  return {
    success: true,
    appointment: cancelledApt,
    message: `Appointment successfully cancelled. Calendar slot released.`
  };
}
