import { config } from '../config/index.js';
import { Appointment } from '@ai-agent/shared';

export interface CalendarSlot {
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  displayTime: string; // "3:00 PM"
  isAvailable: boolean;
  assignedDoctor: string;
}

// In-memory appointments cache for local dev / offline mode
const activeAppointments: Appointment[] = [
  {
    id: 'apt_seed_1',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.com',
    customerPhone: '+1 (415) 892-0192',
    serviceName: 'Whole-Body Cryo & Assessment',
    startTime: '2026-10-02T15:00:00+05:30',
    endTime: '2026-10-02T15:45:00+05:30',
    status: 'confirmed',
    notes: 'Rescheduled from Thursday. Cryo Chamber B.',
    calendarEventId: 'gcal_event_8192a',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt_seed_2',
    customerName: 'Sunita Rao',
    customerEmail: 'sunita.rao@example.com',
    customerPhone: '+91 98200 55432',
    serviceName: 'Aesthetic Skin Assessment',
    startTime: '2026-10-03T11:30:00+05:30',
    endTime: '2026-10-03T12:15:00+05:30',
    status: 'confirmed',
    notes: 'Booked via Web Widget.',
    calendarEventId: 'gcal_event_7391b',
    createdAt: new Date().toISOString()
  }
];

/**
 * Query calendar freebusy slots for a specific date (YYYY-MM-DD)
 */
export async function getFreeBusySlots(dateStr: string): Promise<CalendarSlot[]> {
  const { openTime, closeTime, slotDurationMinutes } = config.business.operatingHours;
  const [openHour] = openTime.split(':').map(Number);
  const [closeHour] = closeTime.split(':').map(Number);

  const slots: CalendarSlot[] = [];

  // Generate 45-minute slots across operating hours
  for (let hour = openHour; hour < closeHour; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === closeHour - 1 && minute > 30) continue;

      const slotStart = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+05:30`);
      const slotEnd = new Date(slotStart.getTime() + slotDurationMinutes * 60 * 1000);

      // Check collision with existing booked appointments
      const isCollision = activeAppointments.some(apt => {
        if (apt.status === 'cancelled') return false;
        const aptStart = new Date(apt.startTime).getTime();
        const aptEnd = new Date(apt.endTime).getTime();
        return (
          (slotStart.getTime() >= aptStart && slotStart.getTime() < aptEnd) ||
          (slotEnd.getTime() > aptStart && slotEnd.getTime() <= aptEnd)
        );
      });

      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const displayTime = `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        displayTime,
        isAvailable: !isCollision,
        assignedDoctor: hour % 2 === 0 ? 'Dr. Marcus Vance' : 'Dr. Ananya Ray'
      });
    }
  }

  return slots;
}

/**
 * Create calendar appointment event
 */
export async function insertCalendarEvent(
  appointment: Omit<Appointment, 'id' | 'calendarEventId' | 'createdAt'>
): Promise<Appointment> {
  const eventId = `gcal_evt_${Date.now().toString(36)}`;
  const fullAppointment: Appointment = {
    ...appointment,
    id: `apt_${Date.now()}`,
    calendarEventId: eventId,
    createdAt: new Date().toISOString()
  };

  activeAppointments.push(fullAppointment);
  return fullAppointment;
}

export function getCachedAppointments(): Appointment[] {
  return activeAppointments;
}
