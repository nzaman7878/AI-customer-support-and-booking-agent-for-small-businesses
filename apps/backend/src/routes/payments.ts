import { Router, Request, Response } from 'express';
import { 
  createDepositPaymentLink, 
  processPaymentSuccess, 
  getAllTransactions, 
  verifyPaymentWebhookSignature 
} from '../services/paymentService.js';

const router = Router();

// Get All Payment Transactions Ledger
router.get('/payments/transactions', (req: Request, res: Response) => {
  const txs = getAllTransactions();
  res.json({
    success: true,
    count: txs.length,
    transactions: txs
  });
});

// Create Dynamic Deposit Payment Link
router.post('/payments/create-link', async (req: Request, res: Response) => {
  try {
    const { appointmentId, customerName, customerEmail, customerPhone, serviceName, amount, provider } = req.body;
    if (!customerName || !serviceName) {
      return res.status(400).json({ success: false, error: 'Customer name and service are required' });
    }

    const tx = await createDepositPaymentLink({
      appointmentId: appointmentId || `apt_${Date.now()}`,
      customerName,
      customerEmail: customerEmail || 'customer@example.com',
      customerPhone: customerPhone || '+91 99887 76655',
      serviceName,
      amount,
      provider
    });

    res.status(201).json({
      success: true,
      transaction: tx,
      paymentLinkUrl: tx.paymentLinkUrl
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Razorpay & Stripe Webhook Receiver
router.post('/payments/webhook', async (req: Request, res: Response) => {
  try {
    const signature = (req.headers['x-razorpay-signature'] || req.headers['stripe-signature'] || 'sig_webhook_header') as string;
    const bodyStr = JSON.stringify(req.body);

    const isValid = verifyPaymentWebhookSignature(bodyStr, signature);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid cryptographic payment signature' });
    }

    const paymentLinkId = req.body.paymentLinkId || req.body.payload?.payment_link?.entity?.id || req.body.data?.object?.id;
    const paymentId = req.body.paymentId || req.body.payload?.payment?.entity?.id || `pay_${Date.now()}`;

    if (!paymentLinkId) {
      return res.status(200).json({ received: true, note: 'Webhook payload missing payment link ID' });
    }

    const result = await processPaymentSuccess({
      paymentLinkId,
      paymentId,
      signature
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and slot confirmed',
      result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Manual 1-Click Simulation of Successful Deposit Payment
router.post('/payments/simulate-success', async (req: Request, res: Response) => {
  try {
    const { paymentLinkId } = req.body;
    const paymentId = `pay_sim_${Date.now().toString(36)}`;

    const result = await processPaymentSuccess({
      paymentLinkId,
      paymentId,
      signature: 'sig_test_valid'
    });

    res.json({
      success: true,
      result
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
