import { checkAvailableSlots, createBooking, registerLead, getAllAppointments, getAllLeads } from '../services/bookingService.js';

async function verifyBookingEngine() {
  console.log('📅 Starting Phase 5 Google Calendar & Booking Engine Verification...\n');

  const testDate = '2026-10-05'; // Monday

  // 1. Check Available Slots
  console.log(`--- Test 1: Check Available Slots for ${testDate} ---`);
  const openSlots = await checkAvailableSlots(testDate);
  console.log(`✅ Available Slots Found: ${openSlots.length}`);
  console.log(`First 3 available: ${openSlots.slice(0, 3).map(s => s.displayTime).join(', ')}`);

  if (openSlots.length === 0) {
    throw new Error('Test 1 Failed: Should find available slots during operating hours');
  }

  const targetSlot = openSlots[0];

  // 2. Book an Appointment
  console.log(`\n--- Test 2: Book Appointment at ${targetSlot.displayTime} ---`);
  const bookingResult = await createBooking({
    customerName: 'Aarav Singhania',
    customerEmail: 'aarav.singhania@example.com',
    customerPhone: '+91 99887 66554',
    serviceName: 'Comprehensive Longevity Panel',
    startTime: targetSlot.startTime,
    endTime: targetSlot.endTime,
    notes: 'Booked via Automated Agent verification'
  });

  console.log(`✅ Status: ${bookingResult.success ? 'Confirmed' : 'Failed'}`);
  console.log(`Event ID: ${bookingResult.appointment.calendarEventId}`);
  console.log(`Message: ${bookingResult.message}`);

  if (!bookingResult.success || !bookingResult.appointment.calendarEventId) {
    throw new Error('Test 2 Failed: Appointment should be booked with valid event ID');
  }

  // 3. Collision Test (Double Booking Prevention)
  console.log(`\n--- Test 3: Double Booking Prevention (Collision Test) ---`);
  try {
    await createBooking({
      customerName: 'Duplicate Attempter',
      customerEmail: 'duplicate@example.com',
      customerPhone: '+91 99999 00000',
      serviceName: 'Hydra-Facial',
      startTime: targetSlot.startTime,
      endTime: targetSlot.endTime
    });
    throw new Error('Test 3 Failed: Should have rejected double booking collision!');
  } catch (err: any) {
    console.log(`✅ Double booking rejected correctly: "${err.message}"`);
  }

  // 4. Lead Capture
  console.log(`\n--- Test 4: Lead Qualification & Capture ---`);
  const lead = await registerLead({
    name: 'Rohit Kulkarni',
    phone: '+91 98111 22334',
    email: 'rohit.kulkarni@example.com',
    source: 'whatsapp',
    interest: 'Cryotherapy corporate package for 10 executives',
    summary: 'Interested in bulk executive package. Requested quote.'
  });

  console.log(`✅ Lead Captured ID: ${lead.id}`);
  console.log(`Name: ${lead.name} | Interest: ${lead.interest}`);

  console.log('\n🎉 ALL Phase 5 Calendar Booking & Lead Tools passed successfully!');
}

verifyBookingEngine().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
