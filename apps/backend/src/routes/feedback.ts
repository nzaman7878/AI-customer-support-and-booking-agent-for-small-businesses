import { Router, Request, Response } from 'express';
import {
  triggerPostAppointmentFeedback,
  processCustomerFeedback,
  recordGoogleReviewClick,
  resolveDetractorIssue,
  getFeedbackOverview,
  getFeedbackSubmissions
} from '../services/feedbackService.js';

const router = Router();

/**
 * GET /api/feedback/overview
 * Return CSAT, NPS score, review conversion funnel & customer submission list
 */
router.get('/feedback/overview', (req: Request, res: Response) => {
  try {
    const overview = getFeedbackOverview();
    const submissions = getFeedbackSubmissions();
    return res.json({
      success: true,
      overview,
      submissions
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/feedback/trigger/:appointmentId
 * Send post-visit survey request message
 */
router.post('/feedback/trigger/:appointmentId', async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.appointmentId as string;
    if (!appointmentId) {
      return res.status(400).json({ success: false, error: 'Appointment ID is required' });
    }

    const result = await triggerPostAppointmentFeedback(appointmentId);
    return res.json(result);
  } catch (err: any) {
    return res.status(404).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/feedback/submit
 * Process inbound customer rating and apply smart review routing
 */
router.post('/feedback/submit', async (req: Request, res: Response) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    if (!appointmentId || rating === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: appointmentId and rating are required'
      });
    }

    const numericRating = Number(rating);
    const result = await processCustomerFeedback({
      appointmentId,
      rating: numericRating,
      comment
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/feedback/track-google-click/:id
 * Track when promoter opens the direct Google Review URL
 */
router.post('/feedback/track-google-click/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const tracked = recordGoogleReviewClick(id);
    return res.json({ success: tracked });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/feedback/resolve/:id
 * Manager marks detractor issue as resolved
 */
router.post('/feedback/resolve/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const resolved = resolveDetractorIssue(id);
    return res.json({ success: resolved });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
