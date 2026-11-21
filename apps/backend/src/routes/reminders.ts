import { Router, Request, Response } from 'express';
import { 
  getReminderLogs, 
  scanAndDispatchUpcomingReminders, 
  cancelAppointmentWithWorkflow 
} from '../services/reminderService.js';
import { 
  getWebhookConfig, 
  updateWebhookConfig, 
  getWebhookLogs, 
  dispatchWebhookEvent 
} from '../services/webhookDispatcher.js';

const router = Router();

// Get Reminder Logs
router.get('/reminders/logs', (req: Request, res: Response) => {
  const logs = getReminderLogs();
  res.json({
    success: true,
    count: logs.length,
    logs
  });
});

// Trigger Reminder Scan
router.post('/reminders/scan', async (req: Request, res: Response) => {
  try {
    const result = await scanAndDispatchUpcomingReminders();
    res.json({
      success: true,
      scannedCount: result.scannedCount,
      remindersDispatched: result.remindersDispatched,
      logs: result.logs
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel appointment
router.post('/appointments/:id/cancel', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const result = await cancelAppointmentWithWorkflow(id, reason);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Webhook Config
router.get('/webhooks/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    config: getWebhookConfig()
  });
});

// Update Webhook Config
router.post('/webhooks/config', (req: Request, res: Response) => {
  try {
    const updated = updateWebhookConfig(req.body);
    res.json({
      success: true,
      config: updated
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get Webhook Dispatch Logs
router.get('/webhooks/logs', (req: Request, res: Response) => {
  const logs = getWebhookLogs();
  res.json({
    success: true,
    count: logs.length,
    logs
  });
});

// Test Outbound Webhook Event Dispatch
router.post('/webhooks/test', async (req: Request, res: Response) => {
  try {
    const { event, data } = req.body;
    const targetEvent = event || 'lead.captured';
    const targetData = data || {
      name: 'Dr. Sarah Lin (Test)',
      phone: '+1 555-019-2831',
      email: 'sarah.lin@example.com',
      interest: 'Full Diagnostic Protocol',
      source: 'web'
    };

    const logEntry = await dispatchWebhookEvent(targetEvent, targetData);
    res.json({
      success: true,
      log: logEntry
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
