import { Router, Request, Response } from 'express';
import { config } from '../config/index.js';
import { processWhatsAppWebhook, sendWhatsAppMessage } from '../integrations/whatsapp.js';

const router = Router();

// Meta Webhook Verification Endpoint
router.get('/whatsapp/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    console.log('[WhatsApp Webhook] Webhook verified successfully by Meta.');
    return res.status(200).send(challenge);
  } else {
    console.warn('[WhatsApp Webhook] Verification token mismatch.');
    return res.status(403).send('Forbidden');
  }
});

// Meta Incoming Message Receiver
router.post('/whatsapp/webhook', async (req: Request, res: Response) => {
  // Always return 200 OK to Meta immediately within < 3 seconds
  res.status(200).send('EVENT_RECEIVED');

  // Process asynchronously
  await processWhatsAppWebhook(req.body);
});

// Manual test trigger for simulating WhatsApp incoming message in development
router.post('/whatsapp/simulate', async (req: Request, res: Response) => {
  try {
    const { from = '919820112345', text = 'Hello', name = 'Simulated User' } = req.body;

    const mockMetaPayload = {
      entry: [{
        changes: [{
          value: {
            contacts: [{ profile: { name } }],
            messages: [{
              from,
              type: 'text',
              text: { body: text },
              timestamp: `${Math.floor(Date.now() / 1000)}`
            }]
          }
        }]
      }]
    };

    const result = await processWhatsAppWebhook(mockMetaPayload);
    res.json({
      success: true,
      simulated: true,
      result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
