import { z } from 'zod';
import { Appointment, Lead } from '@ai-agent/shared';
import { getDb, isDbConnected } from '../db/mongo.js';
import { getFreeBusySlots, insertCalendarEvent, getCachedAppointments, CalendarSlot } from '../integrations/googleCalendar.js';
import { sendImmediateBookingConfirmation } from './reminderService.js';
import { dispatchWebhookEvent } from './webhookDispatcher.js';

export const CreateAppointmentSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(8, 'Phone number is required'),
  serviceName: z.string().min(2, 'Service name is required'),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  notes: z.string().optional()
});

export const CreateLeadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  source: z.enum(['web', 'whatsapp']),
  interest: z.string().min(2, 'Interest is required'),
  summary: z.string()
});

const inMemoryLeads: Lead[] = [
  {
    id: 'lead_1',
    name: 'Chloe Davenport',
    phone: '+1 (310) 902-3341',
    source: 'web',
    interest: 'Couples Hyperbaric Oxygen Therapy',
    qualificationStatus: 'qualified',
    summary: 'Inquired about weekend couples HBOT package. High intent.',
    createdAt: new Date().toISOString()
  }
];

export async function checkAvailableSlots(dateStr: string): Promise<CalendarSlot[]> {
  const allSlots = await getFreeBusySlots(dateStr);
  return allSlots.filter(s => s.isAvailable);
}

export async function createBooking(
  input: z.infer<typeof CreateAppointmentSchema>
): Promise<{ success: boolean; appointment: Appointment; message: string }> {
  // Validate schema
  const validated = CreateAppointmentSchema.parse(input);

  // Check collision
  const reqStart = new Date(validated.startTime).getTime();
  const reqEnd = new Date(validated.endTime).getTime();

  // Check direct collision with existing active appointments
  const activeApts = getCachedAppointments();
  const hasDirectConflict = activeApts.some(apt => {
    if (apt.status === 'cancelled') return false;
    const aptStart = new Date(apt.startTime).getTime();
    const aptEnd = new Date(apt.endTime).getTime();
    return (
      (reqStart >= aptStart && reqStart < aptEnd) ||
      (reqEnd > aptStart && reqEnd <= aptEnd) ||
      (reqStart <= aptStart && reqEnd >= aptEnd)
    );
  });

  if (hasDirectConflict) {
    throw new Error('This time slot is already booked. Please choose another time.');
  }

  const dateStr = validated.startTime.split('T')[0];
  const slots = await getFreeBusySlots(dateStr);
  const targetSlot = slots.find(s => {
    const sStart = new Date(s.startTime).getTime();
    return Math.abs(sStart - reqStart) < 60000;
  });

  if (targetSlot && !targetSlot.isAvailable) {
    throw new Error('This time slot is already booked. Please choose another time.');
  }

  // Create event
  const appointment = await insertCalendarEvent({
    ...validated,
    status: 'confirmed'
  });

  // Persist in MongoDB if available
  const db = getDb();
  if (isDbConnected() && db) {
    try {
      await db.collection('appointments').insertOne(appointment);
    } catch (err: any) {
      console.error('[BookingService] Mongo save error:', err.message);
    }
  }

  // Trigger Immediate Confirmation Notification & Outbound CRM Webhook
  try {
    await sendImmediateBookingConfirmation(appointment);
    await dispatchWebhookEvent('appointment.created', {
      appointmentId: appointment.id,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      serviceName: appointment.serviceName,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      assignedDoctor: appointment.assignedDoctor
    });
  } catch (notifErr: any) {
    console.error('[BookingService] Notification/webhook error:', notifErr.message);
  }

  return {
    success: true,
    appointment,
    message: `Appointment successfully confirmed for ${appointment.customerName} on ${appointment.startTime}`
  };
}

export async function registerLead(input: z.infer<typeof CreateLeadSchema>): Promise<Lead> {
  const validated = CreateLeadSchema.parse(input);
  const newLead: Lead = {
    ...validated,
    id: `lead_${Date.now()}`,
    qualificationStatus: 'new',
    createdAt: new Date().toISOString()
  };

  inMemoryLeads.push(newLead);

  const db = getDb();
  if (isDbConnected() && db) {
    try {
      await db.collection('leads').insertOne(newLead);
    } catch (err: any) {
      console.error('[BookingService] Mongo save lead error:', err.message);
    }
  }

  // Dispatch Outbound CRM Webhook for newly captured lead
  try {
    await dispatchWebhookEvent('lead.captured', {
      id: newLead.id,
      name: newLead.name,
      phone: newLead.phone,
      email: newLead.email,
      source: newLead.source,
      interest: newLead.interest,
      summary: newLead.summary,
      createdAt: newLead.createdAt
    });
  } catch (err: any) {
    console.error('[BookingService] Lead webhook dispatch error:', err.message);
  }

  return newLead;
}

export function getAllAppointments(): Appointment[] {
  return getCachedAppointments();
}

export function getAllLeads(): Lead[] {
  return inMemoryLeads;
}
