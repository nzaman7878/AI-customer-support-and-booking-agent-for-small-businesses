import { indexDocument } from './vectorStore.js';

export async function seedClinicKnowledgeBase(): Promise<void> {
  console.log('[RAG] Seeding default knowledge documents for Apex Wellness Clinic...');

  // 1. Pricing and Services Catalog
  await indexDocument(
    'doc_pricing_2026',
    'Apex Wellness Services & Pricing Catalog 2026',
    'pricing',
    `Apex Wellness & Aesthetics Clinic Official Fee Schedule (2026):
- Initial Medical & Wellness Consultation with Dr. Marcus Vance: $150 (45 mins). Includes health biomarker review and tailored longevity roadmap.
- Comprehensive Longevity Panel & Diagnostics: $450 (60 mins). Full blood panel, VO2 max estimate, and metabolic assessment.
- Whole-Body Sub-Zero Cryotherapy Session: $85 per single session (20 mins). Package of 5 sessions is $350 ($70/session, saving you $75 with bulk discount).
- Hydra-Facial Deluxe Medical Skin Treatment: $180 (45 mins). Deep cleansing, vacuum pore extraction, and hyaluronic infusion.
- Laser Teeth Whitening & Polishing: $220 (45 mins). Professional enamel-safe shade lightening up to 6 shades.
- Hyperbaric Oxygen Therapy (HBOT): $120 per session (60 mins at 1.5 - 2.0 ATA).
All treatments can be booked online or directly through this assistant. Taxes and consumables are included in listed rates.`
  );

  // 2. Cancellation and Rescheduling Policies
  await indexDocument(
    'doc_cancellation_policy',
    'Clinic Rescheduling & Cancellation Policy v2.1',
    'policy',
    `Apex Wellness Clinic Cancellation and Rescheduling Policy:
- Free Rescheduling: Patients may reschedule any scheduled consultation or treatment session at zero penalty as long as the request is made at least 4 hours prior to the booked start time.
- Late Rescheduling / Cancellation (less than 4 hours before session): A late rescheduling fee equal to 25% of the service fee will apply, or the session credit is forfeit.
- No-Show Policy: Failure to attend an appointment without prior notice forfeits the deposit or full prepayment for that session.
- Refund Policy: Pre-purchased session packages are fully refundable within 14 days of purchase provided no sessions have been redeemed. If sessions have been used, remaining balance is refunded prorated at single-session rate.`
  );

  // 3. Operating Hours and Location FAQs
  await indexDocument(
    'doc_clinic_faqs',
    'Apex Wellness General FAQs, Location & Timings',
    'faq',
    `Apex Wellness Clinic Operational Details:
- Operating Hours: We are open Monday through Saturday from 10:00 AM to 7:00 PM (19:00) for both weekday and weekend sessions. We are strictly closed on Sundays and major public holidays.
- Clinic Location: 450 Sutter Healthcare Pavilion, Suite 1200, San Francisco, CA (also operating branch in Mumbai: Bandra West, Turner Road).
- Parking: Complimentary 2-hour underground parking is available with clinic validation in the building basement.
- Insurance & Payment: We accept major credit/debit cards, HSA/FSA cards, Apple Pay, Google Pay, and UPI. We do not directly bill private HMO insurance, but we provide itemized superbills for reimbursement.`
  );

  // 4. Multi-Vertical: Hair & Glam Salon
  await indexDocument(
    'doc_salon_pricing',
    'Luxe Glow Hair & Glam Salon - Pricing & Services',
    'pricing',
    `Luxe Glow Hair & Beauty Studio Official Price List:
- Signature Balayage & Olaplex Glaze: $240 (120 mins). Includes custom root melt, gloss, and blowout.
- Full Set Russian Volume Lash Extensions: $180 (90 mins). 2-week fills available at $85.
- Deluxe Bridal Hair & Makeup Package: $450 (180 mins). Includes trial session and champagne suite.
- Keratin Smoothing Complex Treatment: $320 (150 mins). Formaldehyde-free, lasting up to 5 months.
- Women's Precision Cut & Botanical Scalp Massage: $95 (60 mins).
Operating Hours: Tuesday to Saturday 9:00 AM - 8:00 PM, Sunday 10:00 AM - 5:00 PM. Closed Mondays.
Cancellation Policy: Please notify us at least 24 hours in advance to avoid a 50% late cancellation fee.`
  );

  // 5. Multi-Vertical: Luxury Real Estate
  await indexDocument(
    'doc_realestate_catalog',
    'Prestige Luxury Realty - Private Showings & Escrow Guide',
    'service_catalog',
    `Prestige Luxury Realty Client Advisory & Showing Guidelines:
- Private VIP Home Tour: Complimentary (60 mins). Accompanied showing with a senior luxury property advisor.
- Pre-Listing Appraisal Consultation: $250 (credited back upon exclusive listing agreement).
- Virtual 3D Matterport Walkthroughs: Available 24/7 on all active portfolio listings.
- Escrow Deposit & Earnest Money Policy: Standard 3% earnest money deposit required within 48 hours of contract acceptance.
Showing Requirements: Government-issued ID and mortgage pre-approval letter or proof of funds required for all private viewings exceeding $1.5M.
Office Hours: Monday through Sunday 8:00 AM - 7:00 PM.`
  );

  // 6. Multi-Vertical: Executive Coaching & Consulting
  await indexDocument(
    'doc_coaching_catalog',
    'Apex Leadership & Executive Coaching Programs',
    'service_catalog',
    `Apex Executive Coaching & Strategy Advisory:
- 1:1 Executive Leadership Breakthrough Session: $350 (60 mins). Strategic diagnostic and KPI framework.
- 90-Day C-Suite High Performance Retainer: $3,600 (includes bi-weekly 75-min sessions, 24/7 async review, and team 360-degree feedback review).
- Corporate Executive Offsite Facilitation: $2,500/day.
Rescheduling Policy: Executive clients may reschedule with 12 hours notice at zero penalty.
Sessions conducted via Zoom or in-person at our downtown executive offices.`
  );

  console.log('[RAG] Seed documents indexed successfully into Vector Store.');
}
