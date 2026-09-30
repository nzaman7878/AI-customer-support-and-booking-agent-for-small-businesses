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
- Whole-Body Sub-Zero Cryotherapy Session: $85 per single session (20 mins). Package of 5 sessions is $350 ($70/session).
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
- Late Rescheduling / Cancellation (< 4 hours): A late rescheduling fee equal to 25% of the service fee will apply, or the session credit is forfeit.
- No-Show Policy: Failure to attend an appointment without prior notice forfeits the deposit or full prepayment for that session.
- Refund Policy: Pre-purchased session packages are fully refundable within 14 days of purchase provided no sessions have been redeemed. If sessions have been used, remaining balance is refunded prorated at single-session rate.`
  );

  // 3. Operating Hours and Location FAQs
  await indexDocument(
    'doc_clinic_faqs',
    'Apex Wellness General FAQs, Location & Timings',
    'faq',
    `Apex Wellness Clinic Operational Details:
- Operating Hours: Monday through Saturday from 10:00 AM to 7:00 PM (19:00). Closed on Sundays and major public holidays.
- Clinic Location: 450 Sutter Healthcare Pavilion, Suite 1200, San Francisco, CA (also operating branch in Mumbai: Bandra West, Turner Road).
- Parking: Complimentary 2-hour underground parking is available with clinic validation in the building basement.
- Insurance & Payment: We accept major credit/debit cards, HSA/FSA cards, Apple Pay, Google Pay, and UPI. We do not directly bill private HMO insurance, but we provide itemized superbills for reimbursement.`
  );

  console.log('[RAG] Seed documents indexed successfully into Vector Store.');
}
