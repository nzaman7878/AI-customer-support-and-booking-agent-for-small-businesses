import { seedClinicKnowledgeBase } from '../services/seedKnowledge.js';
import { runAgent } from '../agent/graph.js';

async function verifyAgentGraph() {
  console.log('🤖 Starting Phase 4 LangGraph Agent Engine Verification...\n');

  // Seed knowledge base
  await seedClinicKnowledgeBase();

  // Test 1: RAG Inquiry Flow
  console.log('--- Test 1: Customer Inquiry (RAG Flow) ---');
  const q1 = 'How much does the Hydra-Facial treatment cost?';
  console.log(`User: "${q1}"`);
  const s1 = await runAgent(q1, 'conv_1', 'web');
  console.log(`Detected Intent: ${s1.detectedIntent}`);
  console.log(`Thoughts: ${s1.agentThoughts.length} steps`);
  s1.agentThoughts.forEach(t => console.log(`  ${t}`));
  console.log(`Response: ${s1.finalResponse.slice(0, 120)}...`);

  if (s1.detectedIntent !== 'inquiry' || s1.requiresHumanTakeover) {
    throw new Error('Test 1 Failed: Should route to inquiry RAG without takeover');
  }

  // Test 2: Booking Flow
  console.log('\n--- Test 2: Appointment Booking Request Flow ---');
  const q2 = 'I would like to book a consultation this Friday.';
  console.log(`User: "${q2}"`);
  const s2 = await runAgent(q2, 'conv_2', 'web');
  console.log(`Detected Intent: ${s2.detectedIntent}`);
  s2.agentThoughts.forEach(t => console.log(`  ${t}`));
  console.log(`Response: ${s2.finalResponse.slice(0, 120)}...`);

  if (s2.detectedIntent !== 'booking_request') {
    throw new Error('Test 2 Failed: Should classify as booking_request');
  }

  // Test 3: Rescheduling Flow
  console.log('\n--- Test 3: Reschedule Appointment Flow ---');
  const q3 = 'Can I reschedule my appointment to tomorrow at 3 PM?';
  console.log(`User: "${q3}"`);
  const s3 = await runAgent(q3, 'conv_3', 'whatsapp');
  console.log(`Detected Intent: ${s3.detectedIntent}`);
  s3.agentThoughts.forEach(t => console.log(`  ${t}`));
  console.log(`Response: ${s3.finalResponse.slice(0, 120)}...`);

  if (s3.detectedIntent !== 'reschedule') {
    throw new Error('Test 3 Failed: Should classify as reschedule');
  }

  // Test 4: Upset Customer Escalation / Human Takeover Flow
  console.log('\n--- Test 4: Frustrated Customer Escalation Flow ---');
  const q4 = 'I was charged twice on my card and nobody is answering! Speak to a human immediately!';
  console.log(`User: "${q4}"`);
  const s4 = await runAgent(q4, 'conv_4', 'web');
  console.log(`Detected Intent: ${s4.detectedIntent}`);
  console.log(`Sentiment: ${s4.sentiment}`);
  console.log(`Requires Takeover: ${s4.requiresHumanTakeover}`);
  s4.agentThoughts.forEach(t => console.log(`  ${t}`));
  console.log(`Response: ${s4.finalResponse}`);

  if (!s4.requiresHumanTakeover || s4.sentiment !== 'upset') {
    throw new Error('Test 4 Failed: Frustrated customer must trigger requiresHumanTakeover=true');
  }

  console.log('\n🎉 ALL Phase 4 LangGraph Agent tests passed successfully!');
}

verifyAgentGraph().catch(err => {
  console.error('❌ Agent verification failed:', err);
  process.exit(1);
});
