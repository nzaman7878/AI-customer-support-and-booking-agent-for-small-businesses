import { Router, Request, Response } from 'express';
import { 
  checkAvailableSlots, 
  createBooking, 
  getAllAppointments, 
  registerLead, 
  getAllLeads 
} from '../services/bookingService.js';

const router = Router();

// Get open calendar slots for a date
router.get('/appointments/slots', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const availableSlots = await checkAvailableSlots(date);
    res.json({
      success: true,
      date,
      count: availableSlots.length,
      slots: availableSlots
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List all appointments
router.get('/appointments', (req: Request, res: Response) => {
  const appointments = getAllAppointments();
  res.json({
    success: true,
    count: appointments.length,
    appointments
  });
});

// Book an appointment
router.post('/appointments', async (req: Request, res: Response) => {
  try {
    const result = await createBooking(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// List leads
router.get('/leads', (req: Request, res: Response) => {
  const leads = getAllLeads();
  res.json({
    success: true,
    count: leads.length,
    leads
  });
});

// Capture lead
router.post('/leads', async (req: Request, res: Response) => {
  try {
    const lead = await registerLead(req.body);
    res.status(201).json({
      success: true,
      lead
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
