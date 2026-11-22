import { createBooking, getAllAppointments, checkAvailableSlots } from '../services/bookingService.js';
import { cancelCalendarEvent } from '../integrations/googleCalendar.js';

export async function runPhaseDSuite() {
  console.log('======================================================================');
  console.log('🧪 TEST SUITE: Phase D Audit Fixes (Walk-Ins, Filtering & Responsiveness)');
  console.log('======================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, title: string, detail: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${title}`);
      console.log(`   └─ ${detail}`);
    } else {
      console.error(`❌ [FAIL] ${title}`);
      console.error(`   └─ ${detail}`);
      throw new Error(`Assertion failed: ${title}`);
    }
  }

  // --- Test 1: Walk-in Booking Creation with Doctor Notes ---
  console.log('--- Test 1: Walk-In Reservation Creation ---');
  const targetDate = '2026-11-25';
  const startIso = `${targetDate}T16:00:00+05:30`;
  const endIso = `${targetDate}T16:45:00+05:30`;

  const walkInBooking = await createBooking({
    customerName: 'Aarav Mehta',
    customerEmail: 'aarav.mehta@client.com',
    customerPhone: '+91 98112 33445',
    serviceName: 'Medical & Longevity Consultation',
    startTime: startIso,
    endTime: endIso,
    notes: '[Walk-in / Dr. Marcus Vance] Front desk reception walk-in patient.'
  });

  assert(
    walkInBooking.success === true &&
    walkInBooking.appointment.customerName === 'Aarav Mehta' &&
    walkInBooking.appointment.notes?.includes('[Walk-in / Dr. Marcus Vance]') === true,
    'Walk-in Reservation Ingestion',
    `Created walk-in appointment ID ${walkInBooking.appointment.id} with assigned doctor notes`
  );

  // --- Test 2: Double-Booking / Slot Collision Guardrail ---
  console.log('\n--- Test 2: Slot Collision Guardrail ---');
  let collisionCaught = false;
  try {
    await createBooking({
      customerName: 'Duplicate Requester',
      customerEmail: 'duplicate@client.com',
      customerPhone: '+91 98112 00000',
      serviceName: 'Medical & Longevity Consultation',
      startTime: startIso,
      endTime: endIso,
      notes: 'Should fail due to collision'
    });
  } catch (err: any) {
    if (err.message.includes('already booked')) {
      collisionCaught = true;
    }
  }

  assert(
    collisionCaught === true,
    'Slot Collision Prevention on Overlapping Booking',
    `Collision intercepted for existing slot at ${startIso}`
  );

  // --- Test 3: Dashboard Bookings Search & Status Filtering Logic ---
  console.log('\n--- Test 3: Dashboard Search & Multi-Criteria Filtering ---');
  const allAppointments = getAllAppointments();

  // Test name search
  const nameSearchMatches = allAppointments.filter(apt =>
    (apt.customerName || '').toLowerCase().includes('aarav')
  );
  assert(
    nameSearchMatches.length >= 1 && nameSearchMatches[0].customerName === 'Aarav Mehta',
    'Customer Name Search Filtering',
    `Found Aarav Mehta in filtered results`
  );

  // Test phone search
  const phoneSearchMatches = allAppointments.filter(apt =>
    (apt.customerPhone || '').toLowerCase().includes('33445')
  );
  assert(
    phoneSearchMatches.length >= 1 && phoneSearchMatches[0].customerPhone === '+91 98112 33445',
    'Phone Number Search Filtering',
    `Matched contact '+91 98112 33445'`
  );

  // Test status filter
  const confirmedAppointments = allAppointments.filter(apt => apt.status === 'confirmed');
  assert(
    confirmedAppointments.length >= 2,
    'Status Pill Filter ("confirmed")',
    `Retrieved ${confirmedAppointments.length} confirmed appointments`
  );

  // --- Test 4: Cancellation Lifecycle & Slot Restoration ---
  console.log('\n--- Test 4: Cancellation & Slot Re-availability ---');
  const cancelledApt = cancelCalendarEvent(walkInBooking.appointment.id);

  assert(
    cancelledApt !== null && cancelledApt.status === 'cancelled',
    'Appointment Cancellation Lifecycle',
    `Successfully cancelled ${walkInBooking.appointment.id}, status marked as cancelled`
  );

  // Verify slot is freed up for booking again
  const slotsAfterCancel = await checkAvailableSlots(targetDate);
  const targetSlotAvailable = slotsAfterCancel.some(
    s => Math.abs(new Date(s.startTime).getTime() - new Date(startIso).getTime()) < 60000 && s.isAvailable
  );

  assert(
    targetSlotAvailable === true,
    'Slot Restoration Post-Cancellation',
    `Freed slot at ${startIso} is confirmed available in calendar freebusy inventory`
  );

  console.log('\n======================================================================');
  console.log('📊 PHASE D TEST EXECUTION SUMMARY:');
  console.log('======================================================================\n');
  console.log(`Results: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)\n`);
  console.log('✨ All Phase D audit fixes verified successfully!\n');
}

// Execute directly if run via CLI
if (process.argv[1]?.includes('testPhaseDFixes')) {
  runPhaseDSuite().catch((err) => {
    console.error('Phase D Test Suite Failed:', err);
    process.exit(1);
  });
}
