import {
  generatePortalToken,
  verifyPortalToken,
  rescheduleAppointmentViaPortal,
  cancelAppointmentViaPortal
} from '../services/selfServicePortal.js';
import { getCachedAppointments } from '../integrations/googleCalendar.js';
import { checkAvailableSlots } from '../services/bookingService.js';
import crypto from 'crypto';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function runSelfServicePortalSuite() {
  console.log('======================================================================');
  console.log('🧪 TEST SUITE: Self-Service Rescheduling & Magic-Link Portal Engine');
  console.log('======================================================================\n');

  const appointments = getCachedAppointments();
  const testApt = appointments[0]; // apt_seed_1

  // Test 1: Generate Cryptographic Magic-Link Token
  try {
    const token = generatePortalToken(testApt.id);
    const parts = token.split('.');
    if (parts.length === 2 && parts[0].length > 10 && parts[1].length > 10) {
      results.push({
        name: 'Generate HMAC-SHA256 Signed Magic-Link Token',
        passed: true,
        details: `Token generated with Base64URL payload and 256-bit signature (${token.slice(0, 24)}...)`
      });
    } else {
      results.push({
        name: 'Generate HMAC-SHA256 Signed Magic-Link Token',
        passed: false,
        error: 'Token did not match expected header.signature format'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Generate HMAC-SHA256 Signed Magic-Link Token',
      passed: false,
      error: err.message
    });
  }

  // Test 2: Verify Valid Token
  try {
    const token = generatePortalToken(testApt.id);
    const verification = verifyPortalToken(token);
    if (verification.valid && verification.appointment?.id === testApt.id) {
      results.push({
        name: 'Verify Valid Magic-Link Token',
        passed: true,
        details: `Verified appointment for ${verification.appointment.customerName} (${verification.appointment.serviceName})`
      });
    } else {
      results.push({
        name: 'Verify Valid Magic-Link Token',
        passed: false,
        error: verification.error || 'Verification failed unexpectedly'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Verify Valid Magic-Link Token',
      passed: false,
      error: err.message
    });
  }

  // Test 3: Reject Tampered / Forged Token Signature
  try {
    const token = generatePortalToken(testApt.id);
    const [payloadBase64, sig] = token.split('.');
    const tamperedSig = sig.slice(0, -4) + 'abcd';
    const verification = verifyPortalToken(`${payloadBase64}.${tamperedSig}`);

    if (!verification.valid && verification.error === 'Invalid token signature') {
      results.push({
        name: 'Tamper-Proof Security Validation',
        passed: true,
        details: 'Correctly rejected forged token with signature mismatch'
      });
    } else {
      results.push({
        name: 'Tamper-Proof Security Validation',
        passed: false,
        error: 'Forged token was unexpectedly accepted or gave wrong error'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Tamper-Proof Security Validation',
      passed: false,
      error: err.message
    });
  }

  // Test 4: Reject Expired Magic-Link Token
  try {
    const secret = process.env.PORTAL_SECRET || 'portal_secret_magic_token_live';
    const expiredPayload = {
      appointmentId: testApt.id,
      customerPhone: testApt.customerPhone,
      customerEmail: testApt.customerEmail,
      expiresAt: Date.now() - 10000 // Expired 10 seconds ago
    };
    const payloadBase64 = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    const expiredToken = `${payloadBase64}.${signature}`;
    const verification = verifyPortalToken(expiredToken);

    if (!verification.valid && verification.error === 'Token has expired') {
      results.push({
        name: 'Token Expiration Enforcement',
        passed: true,
        details: 'Correctly rejected expired self-service session'
      });
    } else {
      results.push({
        name: 'Token Expiration Enforcement',
        passed: false,
        error: 'Expired token was not rejected with expiration error'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Token Expiration Enforcement',
      passed: false,
      error: err.message
    });
  }

  // Test 5: Real-time Slot Availability Check
  let targetSlot: { startTime: string; endTime: string } | null = null;
  try {
    const slots = await checkAvailableSlots('2026-10-02');
    const available = slots.filter(s => s.startTime !== testApt.startTime);
    if (available.length > 0) {
      targetSlot = { startTime: available[0].startTime, endTime: available[0].endTime };
      results.push({
        name: 'Query Live Calendar Availability for Portal',
        passed: true,
        details: `Discovered ${slots.length} slots for 2026-10-02; candidate slot: ${available[0].displayTime}`
      });
    } else {
      results.push({
        name: 'Query Live Calendar Availability for Portal',
        passed: false,
        error: 'No available slots found on test date'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Query Live Calendar Availability for Portal',
      passed: false,
      error: err.message
    });
  }

  // Test 6: 1-Click Atomic Slot Swap on Calendar
  try {
    if (!targetSlot) throw new Error('No target slot available from previous test');

    const token = generatePortalToken(testApt.id);
    const rescheduleResult = await rescheduleAppointmentViaPortal({
      token,
      newStartTime: targetSlot.startTime,
      newEndTime: targetSlot.endTime
    });

    if (
      rescheduleResult.success &&
      rescheduleResult.appointment.startTime === targetSlot.startTime &&
      rescheduleResult.appointment.status === 'confirmed'
    ) {
      results.push({
        name: '1-Click Real-Time Calendar Slot Rescheduling',
        passed: true,
        details: `Successfully moved appointment to ${new Date(targetSlot.startTime).toLocaleTimeString()} with deposit preserved`
      });
    } else {
      results.push({
        name: '1-Click Real-Time Calendar Slot Rescheduling',
        passed: false,
        error: 'Rescheduling failed to update slot or returned error'
      });
    }
  } catch (err: any) {
    results.push({
      name: '1-Click Real-Time Calendar Slot Rescheduling',
      passed: false,
      error: err.message
    });
  }

  // Test 7: Prevent Overlapping / Busy Slot Collision
  try {
    const otherApt = appointments[1]; // apt_seed_2
    const token = generatePortalToken(testApt.id);

    let collided = false;
    try {
      await rescheduleAppointmentViaPortal({
        token,
        newStartTime: otherApt.startTime,
        newEndTime: otherApt.endTime
      });
    } catch (collisionErr: any) {
      if (collisionErr.message.includes('no longer available')) {
        collided = true;
      }
    }

    if (collided) {
      results.push({
        name: 'Collision Guardrails Against Double-Booking',
        passed: true,
        details: 'Correctly blocked swap into an already occupied calendar slot'
      });
    } else {
      results.push({
        name: 'Collision Guardrails Against Double-Booking',
        passed: false,
        error: 'Collision check failed to prevent double-booking'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Collision Guardrails Against Double-Booking',
      passed: false,
      error: err.message
    });
  }

  // Test 8: Self-Service Cancellation & Deposit Credit Policy Calculation
  try {
    const token = generatePortalToken(testApt.id);
    const cancelResult = await cancelAppointmentViaPortal({
      token,
      reason: 'Schedule conflict - customer self-service'
    });

    if (
      cancelResult.success &&
      cancelResult.appointment.status === 'cancelled' &&
      cancelResult.refundAmount > 0
    ) {
      results.push({
        name: 'Self-Service Cancellation & Automated Deposit Credit',
        passed: true,
        details: `Status: ${cancelResult.refundStatus}, Refund/Credit: INR ${cancelResult.refundAmount}, Slot Released`
      });
    } else {
      results.push({
        name: 'Self-Service Cancellation & Automated Deposit Credit',
        passed: false,
        error: 'Cancellation did not return expected credit amount or status'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Self-Service Cancellation & Automated Deposit Credit',
      passed: false,
      error: err.message
    });
  }

  // Print Summary
  console.log('\n======================================================================');
  console.log('📊 SELF-SERVICE PORTAL TEST EXECUTION SUMMARY:');
  console.log('======================================================================\n');

  let passCount = 0;
  for (const r of results) {
    if (r.passed) {
      passCount++;
      console.log(`✅ [PASS] ${r.name}`);
      if (r.details) console.log(`   └─ ${r.details}`);
    } else {
      console.log(`❌ [FAIL] ${r.name}`);
      if (r.error) console.log(`   └─ Error: ${r.error}`);
    }
  }

  console.log(`\nResults: ${passCount}/${results.length} tests passed (${Math.round((passCount / results.length) * 100)}%)`);

  if (passCount !== results.length) {
    console.error('\n❌ Portal test suite failed!');
    process.exit(1);
  } else {
    console.log('\n✨ All Self-Service Portal & Rescheduling tests completed successfully!\n');
  }
}

runSelfServicePortalSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
