# Testing Strategy & Benchmark Verification Manual
## OmniAgent: Unit, Integration, Golden Evals & CI/CD Pipeline

---

## 1. Testing Philosophy & Multi-Layer Pyramid
OmniAgent employs a multi-tiered testing strategy ensuring absolute reliability across autonomous agent loops, vector grounding, scheduling concurrency, and customer-facing interfaces.

```
       /\
      /  \     20-Scenario Golden Eval Benchmark (100% Target)
     /────\    Integration Suites (Phase A, B, C, D)
    /      \   Self-Service Portal & Review Funnel Tests
   /────────\  Unit & TypeScript Compilation Verification
  /──────────\
```

---

## 2. Test Suites Inventory

| Command | Target Workspace | Purpose & Scenarios Tested | Pass Rate |
| :--- | :--- | :--- | :---: |
| `npm run test:evals` | `apps/backend` | **20 Golden Evaluation Scenarios**: Groundedness, Booking Precision, Hallucination Prevention, Human Escalation. | **100.0% (20/20)** |
| `npm run test:phase-a`| `apps/backend` | Appointment cancellation, document deletion, omnichannel live session synchronization, human takeover pauses. | **100% (5/5)** |
| `npm run test:phase-b`| `apps/backend` | Standalone magic-link verification, persistent multi-turn widget sessions, multilingual response translation, dynamic slot fetching. | **100% (4/4)** |
| `npm run test:phase-c`| `apps/backend` | Multi-vertical knowledge seeding (Clinic, Salon, Real Estate, Coaching), cross-vertical vector cosine grounding, document deletion lifecycle. | **100% (7/7)** |
| `npm run test:phase-d`| `apps/backend` | Walk-in reservation creation, doctor assignment, double-booking collision guardrails, search/status filtering, slot restoration. | **100% (7/7)** |
| `npm run test:portal` | `apps/backend` | HMAC-SHA256 magic-link token generation, verification, tampering rejection, 1-click slot swapping, cancellation credit. | **100% (8/8)** |
| `npm run test:feedback`| `apps/backend`| Automated review funnel, CSAT/NPS calculations, Promoter Google Maps routing, Detractor care manager shielding. | **100% (8/8)** |
| `npm run build` | Monorepo Root | Full TypeScript compilation across backend, dashboard, widget, and shared packages + Vite production bundling. | **Zero Errors** |

---

## 3. The 20-Scenario Golden Evaluation Suite
The golden evaluation suite (`apps/backend/src/evals/goldenDataset.ts` and `evalRunner.ts`) runs automated assertions across 4 core dimensions:

### 3.1 Dimension 1: Knowledge RAG Accuracy (8 Scenarios)
Verifies that customer inquiries regarding pricing, treatment protocols, operating hours, and cancellation terms are strictly grounded in indexed documents with cosine scores $\ge 0.50$.

### 3.2 Dimension 2: Booking Precision (5 Scenarios)
Tests slot generation, date parsing, FreeBusy availability checks, doctor assignments, and collision detection for overlapping requests.

### 3.3 Dimension 3: Guardrails & Anti-Hallucination (4 Scenarios)
Subjects the agent to out-of-domain questions (e.g. stock market advice, competitive defamation, prompt injection attacks) and asserts that the agent safely deflects without hallucinating.

### 3.4 Dimension 4: Human Escalation Trigger (3 Scenarios)
Injects frustrated or aggressive customer prompts (e.g., billing disputes, medical adverse reaction complaints) and confirms that autonomous generation immediately halts and flags `isHumanTakeover: true`.

---

## 4. Running Tests Locally

```bash
# Run all phase verification suites sequentially
npm run test:phase-a --workspace=apps/backend
npm run test:phase-b --workspace=apps/backend
npm run test:phase-c --workspace=apps/backend
npm run test:phase-d --workspace=apps/backend

# Run the 20-Scenario Golden Eval benchmark
npm run test:evals --workspace=apps/backend

# Verify full monorepo compilation
npm run build
```

---

## 5. Document Cross-References
- Product Requirements: [PRD.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/PRD.md)
- Production Go-Live Sign-Off: [PRODUCTION_GO_LIVE_SIGNOFF.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/PRODUCTION_GO_LIVE_SIGNOFF.md)
- Debugging Manual: [DEBUGGING.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/DEBUGGING.md)
