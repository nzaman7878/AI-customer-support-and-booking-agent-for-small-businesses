import { Router, Request, Response } from 'express';
import { 
  getAnalyticsOverview, 
  getTopTopics, 
  generateAppointmentsCSV, 
  generateLeadsCSV 
} from '../services/analyticsService.js';

const router = Router();

// Get Analytics Overview
router.get('/analytics/overview', (req: Request, res: Response) => {
  try {
    const overview = getAnalyticsOverview();
    res.json({
      success: true,
      analytics: overview
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Top Customer Inquiries & Topic Clusters
router.get('/analytics/topics', (req: Request, res: Response) => {
  try {
    const topics = getTopTopics();
    res.json({
      success: true,
      count: topics.length,
      topics
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export Appointments CSV
router.get('/analytics/export/appointments.csv', (req: Request, res: Response) => {
  try {
    const csvContent = generateAppointmentsCSV();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="omniagent-appointments.csv"');
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).send(`Error generating CSV: ${err.message}`);
  }
});

// Export Leads CSV
router.get('/analytics/export/leads.csv', (req: Request, res: Response) => {
  try {
    const csvContent = generateLeadsCSV();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="omniagent-leads.csv"');
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).send(`Error generating CSV: ${err.message}`);
  }
});

export default router;
