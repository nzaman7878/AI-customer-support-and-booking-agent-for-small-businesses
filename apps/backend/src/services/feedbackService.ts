import { FeedbackSubmission, FeedbackOverview } from '@ai-agent/shared';
import { getCachedAppointments } from '../integrations/googleCalendar.js';
import { sendWhatsAppMessage } from '../integrations/whatsapp.js';
import { dispatchWebhookEvent } from './webhookDispatcher.js';
import { config } from '../config/index.js';

const GOOGLE_REVIEW_URL = process.env.GOOGLE_REVIEW_URL || 'https://g.page/r/apex-wellness-clinic/review';

// Track sent survey invitations
let totalSurveysDispatched = 18;

// In-memory feedback store seeded with initial representative submissions
const feedbackStore: FeedbackSubmission[] = [
  {
    id: 'fb_seed_1',
    appointmentId: 'apt_seed_1',
    customerName: 'Elena Rostova',
    customerPhone: '+1 (415) 892-0192',
    serviceName: 'Whole-Body Cryo & Assessment',
    doctorName: 'Dr. Marcus Vance',
    rating: 5,
    comment: 'Incredible first session! The cold chamber was exhilarating and Dr. Vance explained the recovery protocols thoroughly.',
    category: 'promoter',
    routedTo: 'google_review',
    googleReviewClicked: true,
    managerNotified: false,
    status: 'promoted',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'fb_seed_2',
    appointmentId: 'apt_seed_2',
    customerName: 'Sunita Rao',
    customerPhone: '+91 98200 55432',
    serviceName: 'Aesthetic Skin Assessment',
    doctorName: 'Dr. Ananya Ray',
    rating: 5,
    comment: 'Loved the diagnostic skin analysis. Very professional and no pushy sales.',
    category: 'promoter',
    routedTo: 'google_review',
    googleReviewClicked: true,
    managerNotified: false,
    status: 'promoted',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  },
  {
    id: 'fb_seed_3',
    appointmentId: 'apt_seed_3',
    customerName: 'Marcus Sterling',
    customerPhone: '+1 (212) 555-0182',
    serviceName: 'Sports Recovery Infrared & Cryo',
    doctorName: 'Dr. Marcus Vance',
    rating: 4,
    comment: 'Great facilities. Parking was a bit tight during the evening rush, but session was top notch.',
    category: 'promoter',
    routedTo: 'google_review',
    googleReviewClicked: false,
    managerNotified: false,
    status: 'promoted',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
  },
  {
    id: 'fb_seed_4',
    appointmentId: 'apt_seed_4',
    customerName: 'Devika Menon',
    customerPhone: '+91 97110 33490',
    serviceName: 'HydraFacial Deluxe',
    doctorName: 'Dr. Ananya Ray',
    rating: 2,
    comment: 'Wait time was over 25 minutes past my booked slot time. Treatment itself was okay but felt rushed.',
    category: 'detractor',
    routedTo: 'private_resolution',
    googleReviewClicked: false,
    managerNotified: true,
    status: 'pending',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  }
];

/**
 * Trigger post-service satisfaction survey for a finished appointment
 */
export async function triggerPostAppointmentFeedback(appointmentId: string): Promise<{
  success: boolean;
  message: string;
  surveyText: string;
  customerPhone: string;
}> {
  const appointments = getCachedAppointments();
  const apt = appointments.find(a => a.id === appointmentId);
  if (!apt) {
    throw new Error(`Appointment not found: ${appointmentId}`);
  }

  totalSurveysDispatched++;

  const surveyText = `🌟 *Apex Wellness Clinic Post-Visit Review*\n\n` +
    `Hello ${apt.customerName},\n` +
    `Thank you for visiting us today for your *${apt.serviceName}* with ${apt.assignedDoctor || 'our care team'}.\n\n` +
    `How was your experience today? Please reply with a number from *1 to 5*:\n` +
    `⭐ 5 - Exceptional / Loved it\n` +
    `⭐ 4 - Very Good\n` +
    `⭐ 3 - Average\n` +
    `⭐ 2 - Below Expectations\n` +
    `⭐ 1 - Unacceptable`;

  if (apt.customerPhone) {
    try {
      await sendWhatsAppMessage(apt.customerPhone, surveyText);
    } catch {
      // Simulation fallback
    }
  }

  await dispatchWebhookEvent('appointment.feedback_requested', {
    appointmentId: apt.id,
    customerName: apt.customerName,
    customerPhone: apt.customerPhone,
    serviceName: apt.serviceName
  });

  return {
    success: true,
    message: `Survey invitation dispatched to ${apt.customerName}`,
    surveyText,
    customerPhone: apt.customerPhone
  };
}

/**
 * Process inbound customer rating and intelligently route feedback:
 * - 4-5 Stars: Direct to Google Maps Review deep-link (Reputation Booster)
 * - 1-3 Stars: Divert from public review; route to private manager recovery (Negative Shield)
 */
export async function processCustomerFeedback(params: {
  appointmentId: string;
  rating: number;
  comment?: string;
}): Promise<{
  submission: FeedbackSubmission;
  replyMessage: string;
  googleReviewUrl?: string;
}> {
  const { appointmentId, rating, comment } = params;

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw new Error('Rating must be an integer between 1 and 5');
  }

  const appointments = getCachedAppointments();
  const apt = appointments.find(a => a.id === appointmentId) || {
    id: appointmentId,
    customerName: 'Valued Patient',
    customerPhone: '+1 (555) 000-0000',
    customerEmail: 'patient@example.com',
    serviceName: 'Wellness Session',
    assignedDoctor: 'Staff Specialist'
  };

  const isPromoter = rating >= 4;
  const isNeutral = rating === 3;
  const isDetractor = rating <= 2;

  const category: 'promoter' | 'neutral' | 'detractor' = isPromoter ? 'promoter' : isNeutral ? 'neutral' : 'detractor';
  const routedTo: 'google_review' | 'private_resolution' = isPromoter ? 'google_review' : 'private_resolution';

  let replyMessage = '';
  let googleReviewUrl: string | undefined = undefined;

  if (isPromoter) {
    googleReviewUrl = `${GOOGLE_REVIEW_URL}?rating=${rating}`;
    replyMessage =
      `❤️ *Thank you so much for the ${rating}-star rating, ${apt.customerName}!*\n\n` +
      `Our team and ${apt.assignedDoctor || 'specialist'} are thrilled to hear that you had a wonderful visit.\n\n` +
      `As an independent wellness practice, word-of-mouth on Google helps new clients discover us. Would you take 30 seconds to post your review on Google Maps?\n\n` +
      `👉 *Leave a Google Review*: ${googleReviewUrl}`;
  } else {
    // Negative or neutral: Shield public review and alert care manager
    replyMessage =
      `🙏 *Thank you for your candid feedback, ${apt.customerName}.*\n\n` +
      `We sincerely apologize that your visit did not meet the 5-star standard we strive for. Patient satisfaction and clinical comfort are our highest priorities.\n\n` +
      `Our Clinic Care Director has been notified immediately and will reach out to you within 24 hours to address your feedback personally.`;

    // Fire manager recovery webhook
    await dispatchWebhookEvent('feedback.detractor_alert', {
      appointmentId,
      customerName: apt.customerName,
      customerPhone: apt.customerPhone,
      rating,
      comment: comment || 'No written comment provided',
      actionRequired: 'Manager callback within 24 hours'
    });
  }

  const submission: FeedbackSubmission = {
    id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    appointmentId,
    customerName: apt.customerName,
    customerPhone: apt.customerPhone,
    customerEmail: (apt as any).customerEmail,
    serviceName: apt.serviceName,
    doctorName: apt.assignedDoctor,
    rating,
    comment,
    category,
    routedTo,
    googleReviewClicked: false,
    managerNotified: isDetractor,
    status: isPromoter ? 'promoted' : isNeutral ? 'resolved' : 'pending',
    createdAt: new Date().toISOString()
  };

  feedbackStore.unshift(submission);

  return {
    submission,
    replyMessage,
    googleReviewUrl
  };
}

/**
 * Record when a customer clicks through to leave a Google Review
 */
export function recordGoogleReviewClick(feedbackId: string): boolean {
  const submission = feedbackStore.find(f => f.id === feedbackId);
  if (submission) {
    submission.googleReviewClicked = true;
    return true;
  }
  return false;
}

/**
 * Mark a detractor feedback as resolved after manager callback
 */
export function resolveDetractorIssue(feedbackId: string): boolean {
  const submission = feedbackStore.find(f => f.id === feedbackId);
  if (submission) {
    submission.status = 'resolved';
    return true;
  }
  return false;
}

/**
 * Compute real-time CSAT, Net Promoter Score (NPS), and Review Funnel metrics
 */
export function getFeedbackOverview(): FeedbackOverview {
  const totalResponses = feedbackStore.length;
  const promotersCount = feedbackStore.filter(f => f.category === 'promoter').length;
  const neutralsCount = feedbackStore.filter(f => f.category === 'neutral').length;
  const detractorsCount = feedbackStore.filter(f => f.category === 'detractor').length;

  const csatScore = totalResponses > 0
    ? Math.round((promotersCount / totalResponses) * 100)
    : 100;

  // NPS formula: (% Promoters - % Detractors) ranges from -100 to +100
  const npsScore = totalResponses > 0
    ? Math.round(((promotersCount - detractorsCount) / totalResponses) * 100)
    : 0;

  const googleReviewClicks = feedbackStore.filter(f => f.googleReviewClicked).length;
  const googleReviewClickRate = promotersCount > 0
    ? Math.round((googleReviewClicks / promotersCount) * 100)
    : 0;

  const urgentServiceRecoveryCount = feedbackStore.filter(
    f => f.category === 'detractor' && f.status === 'pending'
  ).length;

  const responseRate = totalSurveysDispatched > 0
    ? Math.min(100, Math.round((totalResponses / totalSurveysDispatched) * 100))
    : 0;

  return {
    totalSurveysSent: totalSurveysDispatched,
    totalResponses,
    responseRate,
    csatScore,
    npsScore,
    promotersCount,
    neutralsCount,
    detractorsCount,
    googleReviewClicks,
    googleReviewClickRate,
    urgentServiceRecoveryCount
  };
}

/**
 * Get all feedback submissions
 */
export function getFeedbackSubmissions(): FeedbackSubmission[] {
  return [...feedbackStore];
}
