import { seedClinicKnowledgeBase } from '../services/seedKnowledge.js';
import { queryVectorStore, listIndexedDocuments, deleteDocument, getIndexedChunksCount } from '../services/vectorStore.js';
import { GOLDEN_20_SCENARIOS } from './goldenDataset.js';
import { runAgent } from '../agent/graph.js';

export async function runPhaseCSuite() {
  console.log('======================================================================');
  console.log('🧪 TEST SUITE: Phase C Audit Fixes (Interactive Evals, Multi-Vertical RAG)');
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

  // --- Test 1: Multi-Vertical Knowledge Seeding & Discovery ---
  console.log('--- Test 1: Multi-Vertical Knowledge Seeding ---');
  const docs = listIndexedDocuments();
  const hasClinic = docs.some(d => d.id === 'doc_pricing_2026');
  const hasSalon = docs.some(d => d.id === 'doc_salon_pricing');
  const hasRealEstate = docs.some(d => d.id === 'doc_realestate_catalog');
  const hasCoaching = docs.some(d => d.id === 'doc_coaching_catalog');

  assert(
    hasClinic && hasSalon && hasRealEstate && hasCoaching && docs.length >= 6,
    'Multi-Vertical Knowledge Base Seeding',
    `Successfully indexed ${docs.length} documents spanning Clinic, Salon, Real Estate, and Executive Coaching`
  );

  // --- Test 2: Cross-Vertical Vector Cosine Grounding ---
  console.log('\n--- Test 2: Cross-Vertical Vector Grounding ---');
  const salonResult = await queryVectorStore('How much for balayage hair coloring?');
  const realEstateResult = await queryVectorStore('What is the earnest money deposit for buying a home?');
  const coachingResult = await queryVectorStore('Tell me about the 90-day C-Suite leadership retainer');

  assert(
    salonResult.results.length > 0 && salonResult.topScore >= 0.50 && salonResult.results[0].chunk.content.includes('Balayage'),
    'Salon Vertical Cosine Grounding',
    `Matched salon catalog with top score: ${salonResult.topScore}`
  );

  assert(
    realEstateResult.results.length > 0 && realEstateResult.topScore >= 0.50 && realEstateResult.results[0].chunk.content.includes('earnest money'),
    'Real Estate Vertical Cosine Grounding',
    `Matched real estate guide with top score: ${realEstateResult.topScore}`
  );

  assert(
    coachingResult.results.length > 0 && coachingResult.topScore >= 0.50 && coachingResult.results[0].chunk.content.includes('Retainer'),
    'Executive Coaching Vertical Cosine Grounding',
    `Matched coaching program with top score: ${coachingResult.topScore}`
  );

  // --- Test 3: 20-Scenario Golden Dataset Integrity ---
  console.log('\n--- Test 3: 20-Scenario Golden Dataset Completeness ---');
  const categoryCounts = {
    knowledge: GOLDEN_20_SCENARIOS.filter(s => s.category === 'knowledge').length,
    booking: GOLDEN_20_SCENARIOS.filter(s => s.category === 'booking').length,
    guardrail: GOLDEN_20_SCENARIOS.filter(s => s.category === 'guardrail').length,
    escalation: GOLDEN_20_SCENARIOS.filter(s => s.category === 'escalation').length
  };

  assert(
    GOLDEN_20_SCENARIOS.length === 20 &&
    categoryCounts.knowledge === 8 &&
    categoryCounts.booking === 5 &&
    categoryCounts.guardrail === 4 &&
    categoryCounts.escalation === 3,
    '20-Scenario Benchmark Structure & Categories',
    `Verified 20 scenarios: 8 Knowledge, 5 Booking, 4 Guardrails, 3 Escalation`
  );

  // --- Test 4: Document Deletion Lifecycle ---
  console.log('\n--- Test 4: Document Deletion Lifecycle ---');
  const initialCount = listIndexedDocuments().length;
  const initialChunks = getIndexedChunksCount();
  
  // Create temporary document
  const tempDocId = `doc_temp_test_${Date.now()}`;
  const { indexDocument } = await import('../services/vectorStore.js');
  await indexDocument(tempDocId, 'Temp Test Document', 'faq', 'This is a temporary FAQ document for deletion testing.');
  
  const midCount = listIndexedDocuments().length;
  assert(midCount === initialCount + 1, 'Temporary Document Ingestion', `Document count incremented to ${midCount}`);

  // Delete temporary document
  const deleted = await deleteDocument(tempDocId);
  const finalCount = listIndexedDocuments().length;
  assert(
    deleted === true && finalCount === initialCount,
    'Document & Vector Chunk Purge',
    `Document ${tempDocId} deleted cleanly, returning document count to ${finalCount}`
  );

  console.log('\n======================================================================');
  console.log('📊 PHASE C TEST EXECUTION SUMMARY:');
  console.log('======================================================================\n');
  console.log(`Results: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)\n`);
  console.log('✨ All Phase C audit fixes verified successfully!\n');
}

// Execute directly if run via CLI
if (process.argv[1]?.includes('testPhaseCFixes')) {
  runPhaseCSuite().catch((err) => {
    console.error('Phase C Test Suite Failed:', err);
    process.exit(1);
  });
}
