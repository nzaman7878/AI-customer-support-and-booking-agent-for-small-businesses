# Engineering Debugging & Diagnostic Manual
## OmniAgent: Troubleshooting Runbooks, Error Signatures & Operational Fixes

---

## 1. Diagnostic Runbooks for Critical Issues

### Issue 1: WhatsApp Webhook Returns 403 Forbidden
- **Symptom**: Meta Developer Console shows red alert: `"Webhook delivery failed with HTTP 403"`.
- **Root Cause**:
  1. `WHATSAPP_VERIFY_TOKEN` in `.env` does not match the token entered in Meta Dashboard.
  2. Or `X-Hub-Signature-256` digest failed due to body-parser consuming raw payload stream before HMAC verification.
- **Resolution**:
  1. Inspect `apps/backend/src/config/index.ts` and verify `config.integrations.whatsapp.verifyToken`.
  2. Verify that Express uses `express.json({ verify: (req, res, buf) => { req.rawBody = buf; } })` to preserve pristine raw bytes for SHA-256 verification.

---

### Issue 2: Calendar Slot Double-Booking Glitch
- **Symptom**: Two clients successfully reserve the same 3:00 PM slot.
- **Root Cause**: String-based comparison between ISO timestamps with differing timezone representations (e.g. `2026-11-25T10:30:00.000Z` vs `2026-11-25T16:00:00+05:30`).
- **Resolution**:
  Use millisecond epoch comparison (`new Date(t1).getTime() === new Date(t2).getTime()`) in `bookingService.ts`. Ensure `hasDirectConflict` inspects active bookings before calendar event insertion.

---

### Issue 3: RAG Cosine Confidence Drops Below 0.50
- **Symptom**: User asks a valid question from clinic documentation, but the agent responds: *"I don't have verified details on that..."*.
- **Root Cause**:
  1. Query phrasing diverges significantly from indexed chunk terminology.
  2. Document chunking sliced key phrases across boundary boundaries without sufficient overlap.
- **Resolution**:
  1. Run `npm run test:rag --workspace=apps/backend` to inspect cosine similarity scores.
  2. Navigate to Dashboard $\rightarrow$ **Knowledge Base** $\rightarrow$ **Vector Chunks Inspector** to verify indexed text segments.
  3. Ensure sliding chunk overlap is maintained at $\ge 50$ tokens.

---

### Issue 4: Human Takeover State Desync
- **Symptom**: Admin presses Takeover toggle in dashboard, but automated WhatsApp replies continue.
- **Root Cause**: In-memory `activeSessions` map key mismatch between WhatsApp `from` phone format (e.g., `whatsapp:+919820055432` vs `+919820055432`).
- **Resolution**:
  Normalize phone numbers with E.164 sanitization (`phone.replace(/\D/g, '')`) before looking up sessions in `activeSessions`.

---

## 2. Fast Diagnostic Commands

```bash
# 1. Run full monorepo build verification
npm run build

# 2. Execute 20-scenario golden evaluation benchmark
npm run test:evals --workspace=apps/backend

# 3. Test self-service magic link portal lifecycle
npm run test:portal --workspace=apps/backend

# 4. Verify review funnel & Google Maps diversion
npm run test:feedback --workspace=apps/backend

# 5. Check real-time vector chunk counts
curl http://localhost:3000/api/documents
```

---

## 3. Document Cross-References
- System Architecture: [ARCHITECTURE.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/ARCHITECTURE.md)
- Complete REST API: [API.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/API.md)
- Testing Suites: [TESTING.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/TESTING.md)
