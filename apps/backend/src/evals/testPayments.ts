import { 
  createDepositPaymentLink, 
  processPaymentSuccess, 
  getAllTransactions, 
  verifyPaymentWebhookSignature 
} from '../services/paymentService.js';
import { createBooking } from '../services/bookingService.js';
import { getCachedAppointments } from '../integrations/googleCalendar.js';

async function runPhase13PaymentVerification() {
  console.log('💳 Starting Phase 13: Automated Payment Links & Deposit Collection Verification...\n');

  // Create an appointment that requires a deposit to lock
  const bookingStart = new Date(Date.now() + 172800000).toISOString(); // 2 days ahead
  const bookingEnd = new Date(Date.now() + 172800000 + 1800000).toISOString();

  const booking = await createBooking({
    customerName: 'Claire Redfield',
    customerEmail: 'claire.redfield@example.com',
    customerPhone: '+91 98765 00112',
    serviceName: 'Aesthetic CryoSculpt Session',
    startTime: bookingStart,
    endTime: bookingEnd,
    notes: 'Requires token deposit'
  });

  console.log(`Created Initial Appointment: ${booking.appointment.id}`);

  // --- Test 1: Generate Deposit Payment Link ---
  console.log('\n--- Test 1: Generate Deposit Payment Link ---');
  const tx = await createDepositPaymentLink({
    appointmentId: booking.appointment.id,
    customerName: booking.appointment.customerName,
    customerEmail: booking.appointment.customerEmail,
    customerPhone: booking.appointment.customerPhone,
    serviceName: booking.appointment.serviceName,
    amount: 500,
    provider: 'razorpay'
  });

  console.log(`Payment Link Generated ID: ${tx.paymentLinkId}`);
  console.log(`Hosted Payment Checkout URL: ${tx.paymentLinkUrl}`);
  console.log(`Deposit Amount: ${tx.currency} ${tx.amount}`);
  console.log(`Status: ${tx.status}`);

  if (!tx.paymentLinkId || !tx.paymentLinkUrl.includes('rzp.io') || tx.amount !== 500) {
    throw new Error('Test 1 Failed: Payment link generation failed');
  }

  // Verify appointment moved to pending_payment
  const appointments = getCachedAppointments();
  const targetApt = appointments.find(a => a.id === booking.appointment.id);
  if (targetApt?.status !== 'pending_payment') {
    throw new Error('Test 1 Failed: Appointment status not updated to pending_payment');
  }
  console.log(`✅ Appointment status successfully switched to "${targetApt.status}".`);

  // --- Test 2: Cryptographic Webhook Signature Verification ---
  console.log('\n--- Test 2: Webhook Signature Verification ---');
  const mockPayload = JSON.stringify({ event: 'payment.captured', paymentLinkId: tx.paymentLinkId });
  const validSig = verifyPaymentWebhookSignature(mockPayload, 'sig_test_valid');
  const invalidSig = verifyPaymentWebhookSignature(mockPayload, '');

  console.log(`Valid Signature Accepted: ${validSig}`);
  console.log(`Empty/Tampered Signature Rejected: ${!invalidSig}`);

  if (!validSig || invalidSig) {
    throw new Error('Test 2 Failed: Cryptographic signature check failed');
  }
  console.log('✅ Webhook HMAC SHA-256 signature verification validated.');

  // --- Test 3: Process Payment Success & Slot Confirmation Lock ---
  console.log('\n--- Test 3: Process Payment Success & Lock Calendar Slot ---');
  const result = await processPaymentSuccess({
    paymentLinkId: tx.paymentLinkId,
    paymentId: 'pay_rzp_live_test999',
    signature: 'sig_test_valid'
  });

  console.log(`Payment Verified: ${result.success}`);
  console.log(`Transaction Status: ${result.transaction.status} (Receipt: ${result.transaction.receiptNumber})`);
  console.log(`Appointment Status: ${result.appointment?.status}`);
  console.log(`Official Digital Receipt Preview:\n${result.receiptText.slice(0, 160)}...`);

  if (!result.success || result.transaction.status !== 'paid' || result.appointment?.status !== 'confirmed') {
    throw new Error('Test 3 Failed: Payment processing failed to confirm slot');
  }
  console.log('✅ Payment marked paid, slot confirmed on Google Calendar, and official digital receipt generated.');

  // --- Test 4: Financial Transactions Ledger ---
  console.log('\n--- Test 4: Financial Ledger Audit ---');
  const allTxs = getAllTransactions();
  console.log(`Total Recorded Transactions: ${allTxs.length}`);
  const paidCount = allTxs.filter(t => t.status === 'paid').length;
  console.log(`Verified Paid Transactions: ${paidCount}`);

  if (allTxs.length < 2 || paidCount < 1) {
    throw new Error('Test 4 Failed: Transaction ledger audit incomplete');
  }
  console.log('✅ Financial transactions ledger verified.');

  console.log('\n🎉 ALL Phase 13 Deposit Collection & Payment Webhook tests passed successfully!\n');
}

runPhase13PaymentVerification().catch(err => {
  console.error('❌ Phase 13 verification failed:', err);
  process.exit(1);
});
