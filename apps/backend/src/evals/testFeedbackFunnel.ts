import {
  triggerPostAppointmentFeedback,
  processCustomerFeedback,
  recordGoogleReviewClick,
  resolveDetractorIssue,
  getFeedbackOverview,
  getFeedbackSubmissions
} from '../services/feedbackService.js';
import { getCachedAppointments } from '../integrations/googleCalendar.js';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function runFeedbackFunnelSuite() {
  console.log('======================================================================');
  console.log('🧪 TEST SUITE: Automated Review Funnel & Reputation Booster (NPS/CSAT)');
  console.log('======================================================================\n');

  const appointments = getCachedAppointments();
  const testApt = appointments[0]; // apt_seed_1

  // Test 1: Trigger Post-Visit Survey Invitation
  try {
    const triggerResult = await triggerPostAppointmentFeedback(testApt.id);
    if (
      triggerResult.success &&
      triggerResult.surveyText.includes('1 to 5') &&
      triggerResult.surveyText.includes(testApt.customerName)
    ) {
      results.push({
        name: 'Trigger Post-Appointment CSAT Survey Invitation',
        passed: true,
        details: `Dispatched survey invitation to ${testApt.customerName} (${testApt.customerPhone})`
      });
    } else {
      results.push({
        name: 'Trigger Post-Appointment CSAT Survey Invitation',
        passed: false,
        error: 'Survey invitation lacked expected text or recipient details'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Trigger Post-Appointment CSAT Survey Invitation',
      passed: false,
      error: err.message
    });
  }

  // Test 2: Process 5-Star Promoter Feedback (Google Review Booster)
  let promoterSubmissionId = '';
  try {
    const feedbackResult = await processCustomerFeedback({
      appointmentId: testApt.id,
      rating: 5,
      comment: 'Exceptional treatment! Completely relieved my chronic shoulder pain.'
    });

    promoterSubmissionId = feedbackResult.submission.id;

    if (
      feedbackResult.submission.category === 'promoter' &&
      feedbackResult.submission.routedTo === 'google_review' &&
      feedbackResult.googleReviewUrl &&
      feedbackResult.googleReviewUrl.includes('g.page') &&
      feedbackResult.replyMessage.includes('Leave a Google Review')
    ) {
      results.push({
        name: 'Promoter Routing: Google Reviews Deep-Link Routing',
        passed: true,
        details: `5-Star rating routed to Google Reviews URL: ${feedbackResult.googleReviewUrl}`
      });
    } else {
      results.push({
        name: 'Promoter Routing: Google Reviews Deep-Link Routing',
        passed: false,
        error: '5-Star rating failed to generate Google Review link or category'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Promoter Routing: Google Reviews Deep-Link Routing',
      passed: false,
      error: err.message
    });
  }

  // Test 3: Process 1-Star Detractor Feedback (Negative Shield & Manager Recovery)
  let detractorSubmissionId = '';
  try {
    const detractorResult = await processCustomerFeedback({
      appointmentId: testApt.id,
      rating: 1,
      comment: 'Appointment was delayed by 40 minutes with no explanation from receptionist.'
    });

    detractorSubmissionId = detractorResult.submission.id;

    if (
      detractorResult.submission.category === 'detractor' &&
      detractorResult.submission.routedTo === 'private_resolution' &&
      detractorResult.submission.managerNotified === true &&
      !detractorResult.googleReviewUrl &&
      !detractorResult.replyMessage.includes('Leave a Google Review') &&
      detractorResult.replyMessage.includes('Clinic Care Director has been notified')
    ) {
      results.push({
        name: 'Detractor Shield: Negative Review Diverted to Private Care Manager',
        passed: true,
        details: 'Diverted 1-Star review from public Google Maps into private escalation queue'
      });
    } else {
      results.push({
        name: 'Detractor Shield: Negative Review Diverted to Private Care Manager',
        passed: false,
        error: 'Detractor rating was not correctly shielded or manager not alerted'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Detractor Shield: Negative Review Diverted to Private Care Manager',
      passed: false,
      error: err.message
    });
  }

  // Test 4: Process 3-Star Neutral Feedback
  try {
    const neutralResult = await processCustomerFeedback({
      appointmentId: testApt.id,
      rating: 3,
      comment: 'Service was standard. Nothing particularly memorable.'
    });

    if (
      neutralResult.submission.category === 'neutral' &&
      neutralResult.submission.routedTo === 'private_resolution' &&
      !neutralResult.googleReviewUrl
    ) {
      results.push({
        name: 'Neutral Feedback Handling (Category Neutral)',
        passed: true,
        details: 'Correctly classified 3-star rating without pushing to Google Maps'
      });
    } else {
      results.push({
        name: 'Neutral Feedback Handling (Category Neutral)',
        passed: false,
        error: 'Neutral rating was miscategorized'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Neutral Feedback Handling (Category Neutral)',
      passed: false,
      error: err.message
    });
  }

  // Test 5: Track Google Review Click-through
  try {
    if (!promoterSubmissionId) throw new Error('Missing promoter ID from Test 2');
    const tracked = recordGoogleReviewClick(promoterSubmissionId);
    const submissions = getFeedbackSubmissions();
    const updated = submissions.find(s => s.id === promoterSubmissionId);

    if (tracked && updated?.googleReviewClicked === true) {
      results.push({
        name: 'Track Google Review Click-Through Conversion',
        passed: true,
        details: `Verified customer clicked through to Google Maps review page (ID: ${promoterSubmissionId})`
      });
    } else {
      results.push({
        name: 'Track Google Review Click-Through Conversion',
        passed: false,
        error: 'Click through tracking failed to update submission state'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Track Google Review Click-Through Conversion',
      passed: false,
      error: err.message
    });
  }

  // Test 6: Manager Service Recovery Resolution
  try {
    if (!detractorSubmissionId) throw new Error('Missing detractor ID from Test 3');
    const resolved = resolveDetractorIssue(detractorSubmissionId);
    const submissions = getFeedbackSubmissions();
    const updated = submissions.find(s => s.id === detractorSubmissionId);

    if (resolved && updated?.status === 'resolved') {
      results.push({
        name: 'Manager Care Recovery Workflow Resolution',
        passed: true,
        details: 'Clinic manager successfully marked customer grievance as resolved'
      });
    } else {
      results.push({
        name: 'Manager Care Recovery Workflow Resolution',
        passed: false,
        error: 'Failed to resolve detractor issue'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Manager Care Recovery Workflow Resolution',
      passed: false,
      error: err.message
    });
  }

  // Test 7: CSAT & Net Promoter Score (NPS) Metric Computations
  try {
    const overview = getFeedbackOverview();
    if (
      typeof overview.csatScore === 'number' &&
      overview.csatScore >= 0 && overview.csatScore <= 100 &&
      typeof overview.npsScore === 'number' &&
      overview.npsScore >= -100 && overview.npsScore <= 100 &&
      overview.promotersCount >= 1 &&
      overview.totalResponses >= 5
    ) {
      results.push({
        name: 'CSAT & Net Promoter Score (NPS) Metric Calculations',
        passed: true,
        details: `CSAT: ${overview.csatScore}% | NPS: +${overview.npsScore} | Total: ${overview.totalResponses} | Google Clicks: ${overview.googleReviewClicks}`
      });
    } else {
      results.push({
        name: 'CSAT & Net Promoter Score (NPS) Metric Calculations',
        passed: false,
        error: 'Computed metrics out of expected mathematical ranges'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'CSAT & Net Promoter Score (NPS) Metric Calculations',
      passed: false,
      error: err.message
    });
  }

  // Test 8: Rating Input Validation Guardrails
  try {
    let rejectedInvalid = false;
    try {
      await processCustomerFeedback({
        appointmentId: testApt.id,
        rating: 6 // invalid rating
      });
    } catch {
      rejectedInvalid = true;
    }

    if (rejectedInvalid) {
      results.push({
        name: 'Rating Input Validation Guardrails (Range 1-5)',
        passed: true,
        details: 'Correctly threw error when rating exceeded 1-5 integer scale'
      });
    } else {
      results.push({
        name: 'Rating Input Validation Guardrails (Range 1-5)',
        passed: false,
        error: 'System allowed out-of-bounds rating'
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Rating Input Validation Guardrails (Range 1-5)',
      passed: false,
      error: err.message
    });
  }

  // Print Summary
  console.log('\n======================================================================');
  console.log('📊 FEEDBACK FUNNEL TEST EXECUTION SUMMARY:');
  console.log('======================================================================\n');

  let passCount = 0;
  for (const r of results) {
    if (r.passed) {
      passCount++;
      console.log(`✅ [PASS] ${r.name}`);
      if (r.details) console.log(`   └─ ${r.details}`);
    } else {
      console.log(`❌ [FAIL] ${r.name}`);
      if (r.error) console.log(`   └─ Error: ${r.error}`);
    }
  }

  console.log(`\nResults: ${passCount}/${results.length} tests passed (${Math.round((passCount / results.length) * 100)}%)`);

  if (passCount !== results.length) {
    console.error('\n❌ Feedback Funnel test suite failed!');
    process.exit(1);
  } else {
    console.log('\n✨ All Review Booster & Feedback Funnel tests completed successfully!\n');
  }
}

runFeedbackFunnelSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
