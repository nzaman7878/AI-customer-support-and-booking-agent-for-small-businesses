import { Router, Request, Response } from 'express';
import {
  generatePortalToken,
  verifyPortalToken,
  rescheduleAppointmentViaPortal,
  cancelAppointmentViaPortal
} from '../services/selfServicePortal.js';
import { checkAvailableSlots } from '../services/bookingService.js';
import { config } from '../config/index.js';

const router = Router();

/**
 * GET /api/portal/token/:appointmentId
 * Generate or retrieve secure Magic-Link token for an appointment
 */
router.get('/portal/token/:appointmentId', (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    if (!appointmentId) {
      return res.status(400).json({ success: false, error: 'Appointment ID is required' });
    }

    const token = generatePortalToken(appointmentId as string);
    return res.json({
      success: true,
      appointmentId,
      token,
      portalUrl: `/portal?token=${encodeURIComponent(token)}`
    });
  } catch (err: any) {
    return res.status(404).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/portal/verify
 * Validate magic-link session token and load appointment state & clinic policy
 */
router.get('/portal/verify', (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token parameter is required' });
    }

    const verification = verifyPortalToken(token);
    if (!verification.valid || !verification.appointment) {
      return res.status(401).json({ success: false, error: verification.error || 'Invalid portal session token' });
    }

    const apt = verification.appointment;
    const currentStartMs = new Date(apt.startTime).getTime();
    const hoursUntilStart = (currentStartMs - Date.now()) / (1000 * 60 * 60);
    const isFreeWindow = hoursUntilStart >= 4;

    return res.json({
      success: true,
      appointment: apt,
      business: {
        name: config.business.name,
        phone: config.business.contactPhone,
        email: config.business.contactEmail,
        currency: config.business.currency,
        operatingHours: config.business.operatingHours
      },
      policy: {
        hoursUntilStart: Math.round(hoursUntilStart * 10) / 10,
        isFreeWindow,
        freeReschedule: isFreeWindow,
        refundPercentage: isFreeWindow ? 100 : 50,
        policySummary: isFreeWindow
          ? 'Free rescheduling and 100% deposit credit available (>4h notice).'
          : 'Late cancellation policy applies (50% fee retained for <4h notice).'
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/portal/slots
 * Load real-time available slots for a given date within self-service portal
 */
router.get('/portal/slots', async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token parameter is required' });
    }

    const verification = verifyPortalToken(token);
    if (!verification.valid) {
      return res.status(401).json({ success: false, error: verification.error || 'Invalid session' });
    }

    const slots = await checkAvailableSlots(date);
    return res.json({
      success: true,
      date,
      slots
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/portal/reschedule
 * 1-Click Calendar Swap with policy validation
 */
router.post('/portal/reschedule', async (req: Request, res: Response) => {
  try {
    const { token, newStartTime, newEndTime } = req.body;
    if (!token || !newStartTime || !newEndTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: token, newStartTime, and newEndTime are required'
      });
    }

    const result = await rescheduleAppointmentViaPortal({
      token,
      newStartTime,
      newEndTime
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/portal/cancel
 * Self-service cancellation with automated deposit refund/credit calculation
 */
router.post('/portal/cancel', async (req: Request, res: Response) => {
  try {
    const { token, reason } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const result = await cancelAppointmentViaPortal({
      token,
      reason
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
