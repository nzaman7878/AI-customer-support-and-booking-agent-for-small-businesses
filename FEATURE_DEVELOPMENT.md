# Feature Development Guide
## OmniAgent: Developer Walkthroughs, Extensibility & Best Practices

---

## 1. Overview & Monorepo Workflow
OmniAgent is designed for rapid modular extension. New capabilities can be added across the agent intelligence loop, vector knowledge store, external integrations, or the administrative dashboard.

```
┌─────────────────────────────────────────────────────────────┐
│                   Feature Extension Points                  │
│                                                             │
│ 1. LangGraph Nodes       --> apps/backend/src/agent/        │
│ 2. Knowledge Seeder      --> apps/backend/src/services/     │
│ 3. API Routes            --> apps/backend/src/routes/       │
│ 4. Dashboard Views       --> apps/dashboard/src/            │
│ 5. Golden Evals          --> apps/backend/src/evals/        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Step-by-Step Tutorials

### Tutorial 1: Adding a New Vertical to White-Label Studio & RAG Seeder
To add a new industry vertical (e.g. Pet Care / Veterinary Clinic):

1. **Update Industry Type** in `packages/shared/src/index.ts`:
   ```typescript
   export type BusinessIndustry = 'clinic' | 'salon' | 'realestate' | 'coaching' | 'veterinary';
   ```

2. **Add Seed Knowledge Documents** in `apps/backend/src/services/seedKnowledge.ts`:
   ```typescript
   export const VETERINARY_DOCUMENTS = [
     {
       id: 'doc_vet_pricing',
       title: 'Veterinary Wellness & Vaccine Pricing',
       category: 'pricing',
       content: 'Routine Canine Wellness Exam: ₹2,200. Rabies + DHPP Vaccine Bundle: ₹3,500...'
     }
   ];
   ```

3. **Register White-Label Defaults** in `apps/backend/src/services/businessConfigService.ts`:
   Define operating hours, brand colors, default doctor/specialist roster, and greeting chips.

4. **Verify Grounding**: Add a test scenario in `testPhaseCFixes.ts` to assert vector search retrieves veterinary queries with score $\ge 0.50$.

---

### Tutorial 2: Creating a New LangGraph Tool Node
To add a new autonomous tool (e.g., checking customer loyalty reward points):

1. **Define Tool Schema with Zod**:
   ```typescript
   export const CheckLoyaltyPointsSchema = z.object({
     customerPhone: z.string().min(8)
   });
   ```

2. **Implement Tool Function**:
   Query customer points balance from the database or external loyalty API.

3. **Attach to LangGraph Runner** in `apps/backend/src/agent/graph.ts`:
   Add a conditional edge from `triageNode` to `loyaltyToolNode` when intent is classified as `rewards_inquiry`.

---

### Tutorial 3: Authoring a Golden Eval Scenario
When adding a new feature, protect it against future regressions by adding a scenario to `apps/backend/src/evals/goldenDataset.ts`:
```typescript
{
  id: 'scenario_vet_pricing_1',
  category: 'knowledge',
  description: 'Inquires about canine wellness exam pricing',
  userMessage: 'How much is a routine checkup for my dog?',
  expectedBehavior: 'grounded_rag_response',
  evaluationCriteria: {
    mustContain: ['₹2,200', 'Canine Wellness Exam'],
    mustNotContain: ['₹6,500', 'Hydra-Facial'],
    minConfidence: 0.50
  }
}
```

---

## 3. Pre-Commit Verification Checklist
Before submitting code:
- [ ] TypeScript compilation: `npm run build` exits with code 0.
- [ ] Golden Eval Benchmark: `npm run test:evals` passes 100%.
- [ ] Unit & Integration Suites: `npm test` passes across all workspaces.
- [ ] Code conventions: No raw `any` types; all inputs validated via Zod.

---

## 4. Document Cross-References
- System Architecture: [ARCHITECTURE.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/ARCHITECTURE.md)
- Complete REST API: [API.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/API.md)
- Testing Guide: [TESTING.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/TESTING.md)
