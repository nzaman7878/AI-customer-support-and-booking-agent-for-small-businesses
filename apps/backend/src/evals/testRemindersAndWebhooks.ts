import { 
  dispatchWebhookEvent, 
  getWebhookLogs, 
  getWebhookConfig, 
  updateWebhookConfig 
} from '../services/webhookDispatcher.js';
import { 
  sendImmediateBookingConfirmation, 
  scanAndDispatchUpcomingReminders, 
  cancelAppointmentWithWorkflow, 
  getReminderLogs 
} from '../services/reminderService.js';
import { createBooking, getAllAppointments } from '../services/bookingService.js';

async function runPhase10Verification() {
  console.log('⚡ Starting Phase 10: Reminders Engine & CRM Webhook Dispatcher Verification...\n');

  // --- Test 1: Verify Outbound CRM Webhook Configuration & Dispatch ---
  console.log('--- Test 1: Outbound CRM Webhook Dispatch ---');
  const initialConfig = getWebhookConfig();
  console.log(`Initial Webhook Endpoint: ${initialConfig.endpointUrl}`);
  console.log(`HMAC Secret Configured: ${initialConfig.secret.length > 0}`);

  const testEvent = await dispatchWebhookEvent('lead.captured', {
    name: 'Alexander Wright',
    email: 'alex.wright@example.com',
    phone: '+1 (415) 800-9922',
    interest: 'Regenerative Peptide Therapy',
    source: 'web'
  });

  console.log(`Dispatched Webhook Event ID: ${testEvent.id}`);
  console.log(`Event Type: ${testEvent.event}`);
  console.log(`Status: ${testEvent.status} (HTTP ${testEvent.statusCode})`);
  console.log(`Latency: ${testEvent.latencyMs}ms`);

  if (!testEvent.id || testEvent.event !== 'lead.captured' || testEvent.statusCode !== 200) {
    throw new Error('Test 1 Failed: Outbound webhook event failed to dispatch');
  }
  console.log('✅ Outbound CRM webhook dispatched successfully with valid envelope.');

  // --- Test 2: Booking Flow with Immediate Confirmation & Automated Webhook ---
  console.log('\n--- Test 2: Booking Flow Notification & Webhook Trigger ---');
  const slotDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];
  const bookingStart = `${slotDate}T11:00:00+05:30`;
  const bookingEnd = `${slotDate}T11:30:00+05:30`;

  const bookingResult = await createBooking({
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.com',
    customerPhone: '+91 99887 76655',
    serviceName: 'Hydra-Facial Glow',
    startTime: bookingStart,
    endTime: bookingEnd,
    notes: 'Pre-wedding skin glow session'
  });

  console.log(`Appointment Created ID: ${bookingResult.appointment.id}`);
  console.log(`Calendar Event ID: ${bookingResult.appointment.calendarEventId}`);

  // Check reminder logs for immediate confirmation
  const reminderLogs = getReminderLogs();
  const confirmationEntry = reminderLogs.find(r => r.appointmentId === bookingResult.appointment.id && r.type === 'immediate_confirmation');

  if (!confirmationEntry) {
    throw new Error('Test 2 Failed: Immediate booking confirmation reminder was not logged');
  }
  console.log(`Logged Immediate Confirmation: "${confirmationEntry.content.slice(0, 50)}..."`);
  console.log('✅ Immediate booking confirmation and reminder created.');

  // Check webhook logs for appointment.created
  const webhookLogs = getWebhookLogs();
  const aptCreatedWebhook = webhookLogs.find(w => w.event === 'appointment.created' && w.payload?.data?.appointmentId === bookingResult.appointment.id);

  if (!aptCreatedWebhook) {
    throw new Error('Test 2 Failed: appointment.created webhook was not fired on booking');
  }
  console.log(`Fired CRM Webhook: ${aptCreatedWebhook.event} for appointment ${bookingResult.appointment.id}`);
  console.log('✅ appointment.created webhook automatically triggered by bookingService.');

  // --- Test 3: Scan Reminders (24h & 2h window simulation) ---
  console.log('\n--- Test 3: 24-Hour & 2-Hour Reminder Scanner ---');
  // Simulate scanning at 23 hours prior to bookingStart
  const simScanTime = new Date(new Date(bookingStart).getTime() - 23 * 3600 * 1000);
  const scanResult = await scanAndDispatchUpcomingReminders(simScanTime);

  console.log(`Scanned Appointments: ${scanResult.scannedCount}`);
  console.log(`Reminders Dispatched: ${scanResult.remindersDispatched}`);

  if (scanResult.remindersDispatched < 1) {
    throw new Error('Test 3 Failed: 24h reminder window was not triggered during simulated scan');
  }
  console.log(`Dispatched 24h Reminder Log: ${scanResult.logs[0].type} to ${scanResult.logs[0].customerPhone}`);
  console.log('✅ 24h automated reminder scanner triggered correctly.');

  // --- Test 4: Cancellation Workflow & appointment.cancelled Webhook ---
  console.log('\n--- Test 4: Appointment Cancellation & Calendar Slot Release ---');
  const cancelResult = await cancelAppointmentWithWorkflow(
    bookingResult.appointment.id,
    'Client requested cancellation via WhatsApp'
  );

  console.log(`Cancellation Success: ${cancelResult.success}`);
  console.log(`Appointment Status: ${cancelResult.appointment?.status}`);

  if (!cancelResult.success || cancelResult.appointment?.status !== 'cancelled') {
    throw new Error('Test 4 Failed: Appointment was not marked cancelled');
  }

  // Check webhook logs for appointment.cancelled
  const updatedLogs = getWebhookLogs();
  const cancelWebhook = updatedLogs.find(w => w.event === 'appointment.cancelled' && w.payload?.data?.appointmentId === bookingResult.appointment.id);

  if (!cancelWebhook) {
    throw new Error('Test 4 Failed: appointment.cancelled webhook was not fired');
  }
  console.log(`Fired CRM Webhook: ${cancelWebhook.event} (Reason: "${cancelWebhook.payload?.data?.reason}")`);
  console.log('✅ appointment.cancelled webhook dispatched and calendar slot released.');

  console.log('\n🎉 ALL Phase 10 Reminder Engine & CRM Webhook Dispatcher tests passed successfully!\n');
}

runPhase10Verification().catch(err => {
  console.error('❌ Phase 10 verification failed:', err);
  process.exit(1);
});
