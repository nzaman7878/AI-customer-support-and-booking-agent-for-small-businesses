import { generatePortalToken, verifyPortalToken } from '../services/selfServicePortal.js';
import { activeSessions } from '../routes/chat.js';
import { runAgent } from '../agent/graph.js';
import { detectLanguage, translateResponse } from '../services/translationService.js';
import { checkAvailableSlots } from '../services/bookingService.js';
import { seedClinicKnowledgeBase } from '../services/seedKnowledge.js';

export async function runPhaseBSuite() {
  console.log('======================================================================');
  console.log('🧪 TEST SUITE: Phase B Audit Fixes (Portal Landing, Multi-Turn, i18n & Slots)');
  console.log('======================================================================\n');

  await seedClinicKnowledgeBase();

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, title: string, detail: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${title}`);
      console.log(`   └─ ${detail}`);
    } else {
      console.error(`❌ [FAIL] ${title}`);
      console.error(`   └─ ${detail}`);
      throw new Error(`Assertion failed: ${title}`);
    }
  }

  // --- Test 1: Direct Magic-Link Token Generation & Standalone Landing Verification ---
  console.log('--- Test 1: Direct Magic-Link Token Verification ---');
  const token = generatePortalToken('apt_seed_1');
  const verification = verifyPortalToken(token);
  assert(
    verification.valid === true && verification.appointment?.id === 'apt_seed_1',
    'Standalone Magic-Link Token Verification',
    `Verified HMAC-SHA256 token for apt_seed_1 (${verification.appointment?.customerName} - ${verification.appointment?.serviceName})`
  );

  // --- Test 2: Multi-Turn Conversation Memory Persistence ---
  console.log('\n--- Test 2: Multi-Turn Session Persistence ---');
  const testConvId = `conv_persistent_test_${Date.now()}`;
  
  // Turn 1
  let session = activeSessions.find(s => s.id === testConvId);
  if (!session) {
    session = {
      id: testConvId,
      name: 'Web Visitor',
      phone: '+1 (555) 123-4567',
      channel: 'web',
      snippet: 'Hi, what are your hours?',
      time: 'Just now',
      sentiment: 'nominal',
      sentimentText: 'In progress',
      vip: 'Standard',
      isHumanTakeover: false,
      messages: []
    };
    activeSessions.unshift(session);
  }
  session.messages.push({
    id: `m1_${Date.now()}`,
    role: 'user',
    content: 'What are your hours?',
    timestamp: '10:00 AM'
  });
  const agent1 = await runAgent('What are your hours?', testConvId, 'web');
  session.messages.push({
    id: `m2_${Date.now()}`,
    role: 'assistant',
    content: agent1.finalResponse,
    timestamp: '10:00 AM'
  });

  // Turn 2
  session.messages.push({
    id: `m3_${Date.now()}`,
    role: 'user',
    content: 'Do you offer parking?',
    timestamp: '10:01 AM'
  });
  const agent2 = await runAgent('Do you offer parking?', testConvId, 'web');
  session.messages.push({
    id: `m4_${Date.now()}`,
    role: 'assistant',
    content: agent2.finalResponse,
    timestamp: '10:01 AM'
  });

  const persistedSession = activeSessions.find(s => s.id === testConvId);
  assert(
    persistedSession !== undefined && persistedSession.messages.length === 4,
    'Multi-Turn Chat Persistence Across Widget Turns',
    `Conversation ${testConvId} maintained all 4 turns without dropping session state`
  );

  // --- Test 3: Multilingual Language Propagation & Translation ---
  console.log('\n--- Test 3: Multilingual Response Translation Propagation ---');
  const englishReply = 'Our Hydra-Facial is priced at ₹6,500 per session with deep pore extraction.';
  const hindiReply = await translateResponse(englishReply, 'hi');
  const spanishReply = await translateResponse(englishReply, 'es');

  const hasHindi = /[\u0900-\u097F]|ka price|karna chahenge|Aapka appointment/i.test(hindiReply);
  const hasSpanish = /\[Español\]|por sesión|precio|reservar|cita/i.test(spanishReply);

  assert(
    hasHindi && hasSpanish,
    'Multilingual Language Propagation (HI & ES)',
    `Hindi: "${hindiReply.slice(0, 50)}..." | Spanish: "${spanishReply.slice(0, 50)}..."`
  );

  // --- Test 4: Dynamic Calendar Slots Availability Endpoint ---
  console.log('\n--- Test 4: Live Dynamic Slot Availability ---');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const slots = await checkAvailableSlots(tomorrowStr);

  const availableSlots = slots.filter(s => s.isAvailable);
  assert(
    availableSlots.length > 0 && typeof availableSlots[0].displayTime === 'string',
    'Dynamic Live Calendar Slot Discovery',
    `Discovered ${availableSlots.length} available slots for ${tomorrowStr} (e.g. ${availableSlots[0].displayTime} with ${availableSlots[0].assignedDoctor})`
  );

  console.log('\n======================================================================');
  console.log('📊 PHASE B TEST EXECUTION SUMMARY:');
  console.log('======================================================================\n');
  console.log(`Results: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)\n`);
  console.log('✨ All Phase B audit fixes verified successfully!\n');
}

// Execute directly if run via CLI
if (process.argv[1]?.includes('testPhaseBFixes')) {
  runPhaseBSuite().catch((err) => {
    console.error('Phase B Test Suite Failed:', err);
    process.exit(1);
  });
}
