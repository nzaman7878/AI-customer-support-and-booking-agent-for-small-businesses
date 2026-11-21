import { Router, Request, Response } from 'express';
import { config } from '../config/index.js';
import { getDb, isDbConnected } from '../db/mongo.js';

export interface BusinessConfig {
  id: string;
  name: string;
  industry: 'clinic' | 'salon' | 'real_estate' | 'coaching' | 'general';
  tagline: string;
  welcomeMessage: string;
  primaryColor: string;
  accentColor: string;
  timezone: string;
  contactEmail: string;
  contactPhone: string;
  operatingHours: {
    days: string[];
    openTime: string;
    closeTime: string;
    slotDurationMinutes: number;
  };
  promptChips: string[];
}

export const BUSINESS_PRESETS: Record<string, BusinessConfig> = {
  clinic: {
    id: 'preset_clinic',
    name: 'Apex Wellness & Aesthetics Clinic',
    industry: 'clinic',
    tagline: 'Longevity, Regenerative Medicine & Aesthetic Care',
    welcomeMessage: 'Welcome to Apex Wellness Clinic. I am your autonomous health concierge. How can I assist your longevity and recovery journey today?',
    primaryColor: '#6366f1',
    accentColor: '#10b981',
    timezone: 'Asia/Kolkata',
    contactEmail: 'support@apexwellness.example',
    contactPhone: '+91 98765 43210',
    operatingHours: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      openTime: '10:00',
      closeTime: '19:00',
      slotDurationMinutes: 30
    },
    promptChips: [
      'Book a consultation',
      'Hydra-Facial pricing',
      'Cryotherapy package discount',
      'Rescheduling policy'
    ]
  },
  salon: {
    id: 'preset_salon',
    name: 'Luxe Glow Hair & Aesthetics Lounge',
    industry: 'salon',
    tagline: 'Master Hair Sculpting, Organic Facials & Bridal Glam',
    welcomeMessage: 'Hello gorgeous! Welcome to Luxe Glow Lounge. Looking for a hair transformation, facial glow, or bridal package? Ask me anything!',
    primaryColor: '#ec4899',
    accentColor: '#f59e0b',
    timezone: 'Asia/Kolkata',
    contactEmail: 'bookings@luxeglow.example',
    contactPhone: '+91 98200 11223',
    operatingHours: {
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      openTime: '10:30',
      closeTime: '20:30',
      slotDurationMinutes: 45
    },
    promptChips: [
      'Book Balayage coloring',
      'Bridal makeup rates',
      'Keratin treatment time',
      'Saturday availability'
    ]
  },
  real_estate: {
    id: 'preset_real_estate',
    name: 'Skyline Premier Real Estate Agency',
    industry: 'real_estate',
    tagline: 'Luxury Penthouses, Seaside Villas & High-Yield Commercial Assets',
    welcomeMessage: 'Welcome to Skyline Premier Realty. I can assist you with property floorplans, pricing brochures, and private VIP site visit bookings.',
    primaryColor: '#0ea5e9',
    accentColor: '#3b82f6',
    timezone: 'Asia/Kolkata',
    contactEmail: 'concierge@skylinepremier.example',
    contactPhone: '+91 98333 44556',
    operatingHours: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      openTime: '09:00',
      closeTime: '19:30',
      slotDurationMinutes: 60
    },
    promptChips: [
      'Schedule a site tour',
      '3BHK Sea-View pricing',
      'Rental yield & ROI',
      'Speak to investment advisor'
    ]
  },
  coaching: {
    id: 'preset_coaching',
    name: 'Ascend Competitive Academy & IIT/NEET Prep',
    industry: 'coaching',
    tagline: 'Top-Rank Faculty Mentorship, Crash Courses & Scholarship Exams',
    welcomeMessage: 'Namaste! Welcome to Ascend Academy. I can share batch schedules, scholarship test dates, fee structures, or book an academic counseling slot.',
    primaryColor: '#f97316',
    accentColor: '#10b981',
    timezone: 'Asia/Kolkata',
    contactEmail: 'admissions@ascendacademy.example',
    contactPhone: '+91 98444 55667',
    operatingHours: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      openTime: '08:30',
      closeTime: '19:00',
      slotDurationMinutes: 30
    },
    promptChips: [
      'JEE 2-Year Batch fees',
      'Scholarship test registration',
      'Book counselor meeting',
      'Hostel facility details'
    ]
  }
};

let currentConfig: BusinessConfig = { ...BUSINESS_PRESETS.clinic };

const router = Router();

// GET active business configuration
router.get('/business/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    config: currentConfig
  });
});

// GET all available demo presets
router.get('/business/presets', (req: Request, res: Response) => {
  res.json({
    success: true,
    presets: BUSINESS_PRESETS
  });
});

// UPDATE active business configuration (or switch preset)
router.put('/business/config', async (req: Request, res: Response) => {
  try {
    const { preset, ...customFields } = req.body;

    if (preset && BUSINESS_PRESETS[preset]) {
      currentConfig = { ...BUSINESS_PRESETS[preset], ...customFields };
    } else {
      currentConfig = {
        ...currentConfig,
        ...customFields
      };
    }

    // Update global app config values so agent & calendar reflect the new business
    config.business.name = currentConfig.name;
    config.business.industry = currentConfig.industry as any;
    config.business.contactEmail = currentConfig.contactEmail;
    config.business.contactPhone = currentConfig.contactPhone;
    if (currentConfig.operatingHours) {
      config.business.operatingHours = currentConfig.operatingHours;
    }

    const db = getDb();
    if (isDbConnected() && db) {
      try {
        await db.collection('business_settings').updateOne(
          { id: 'active_config' },
          { $set: { ...currentConfig, updatedAt: new Date().toISOString() } },
          { upsert: true }
        );
      } catch (err: any) {
        console.error('[BusinessConfig] Mongo save error:', err.message);
      }
    }

    res.json({
      success: true,
      message: `Business configuration updated for "${currentConfig.name}" (${currentConfig.industry})`,
      config: currentConfig
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
