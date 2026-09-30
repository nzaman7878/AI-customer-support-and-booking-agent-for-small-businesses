import { seedClinicKnowledgeBase } from '../services/seedKnowledge.js';
import { queryVectorStore, listIndexedDocuments } from '../services/vectorStore.js';

async function runRAGVerification() {
  console.log('🧪 Starting Phase 3 RAG & Vector Search Verification...\n');

  // Step 1: Seed
  await seedClinicKnowledgeBase();
  const docs = listIndexedDocuments();
  console.log(`✅ Indexed Documents: ${docs.length}`);

  // Test 1: Pricing question
  const query1 = 'What is the price of the Hydra-Facial skin treatment?';
  console.log(`\n--- Test 1: Grounded Pricing Query ---`);
  console.log(`Query: "${query1}"`);
  const res1 = await queryVectorStore(query1);
  console.log(`Top Score: ${(res1.topScore * 100).toFixed(1)}%`);
  console.log(`Is Grounded: ${res1.isGrounded}`);
  console.log(`Fallback Triggered: ${res1.fallbackTriggered}`);
  console.log(`Answer: ${res1.synthesizedAnswer.slice(0, 140)}...`);

  if (!res1.isGrounded || res1.fallbackTriggered) {
    throw new Error('Test 1 Failed: Pricing query should be grounded');
  }

  // Test 2: Policy question
  const query2 = 'What happens if I reschedule my appointment 5 hours in advance?';
  console.log(`\n--- Test 2: Policy & Rescheduling Query ---`);
  console.log(`Query: "${query2}"`);
  const res2 = await queryVectorStore(query2);
  console.log(`Results length: ${res2.results.length}`);
  res2.results.forEach((r, idx) => console.log(`  [${idx}] ${r.documentTitle} -> score: ${(r.score * 100).toFixed(1)}%`));
  console.log(`Top Score: ${(res2.topScore * 100).toFixed(1)}%`);
  console.log(`Is Grounded: ${res2.isGrounded}`);
  console.log(`Fallback Triggered: ${res2.fallbackTriggered}`);
  console.log(`Answer: ${res2.synthesizedAnswer.slice(0, 140)}...`);

  if (!res2.isGrounded || res2.fallbackTriggered) {
    throw new Error('Test 2 Failed: Rescheduling policy should be grounded');
  }

  // Test 3: Out-of-scope / Un-grounded query
  const query3 = 'What is the recipe for chocolate lava cake and how to make a spaceship?';
  console.log(`\n--- Test 3: Out-of-Scope Query (Zero-Hallucination Fallback) ---`);
  console.log(`Query: "${query3}"`);
  const res3 = await queryVectorStore(query3);
  console.log(`Top Score: ${(res3.topScore * 100).toFixed(1)}%`);
  console.log(`Is Grounded: ${res3.isGrounded}`);
  console.log(`Fallback Triggered: ${res3.fallbackTriggered}`);
  console.log(`Answer: ${res3.synthesizedAnswer}`);

  if (res3.isGrounded || !res3.fallbackTriggered) {
    throw new Error('Test 3 Failed: Out of scope query must trigger fallback to prevent hallucination');
  }

  console.log('\n🎉 ALL Phase 3 RAG tests passed successfully!');
}

runRAGVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
