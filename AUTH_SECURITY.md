# Authentication, Security & Threat Model
## OmniAgent: Data Protection, Cryptographic Signatures & LLM Guardrails

---

## 1. Executive Summary & Threat Model
OmniAgent operates across public communication channels (Web Chat, Meta WhatsApp) while processing high-sensitivity business workflows (appointment reservations, patient names, phone numbers, payment deposits).

### 1.1 Key Threat Vectors Analyzed
1. **Tampering with Self-Service Links**: An attacker forging a URL parameter to cancel or alter another customer's appointment.
2. **LLM Prompt Injections & Jailbreaks**: Malicious prompts attempting to extract proprietary system prompts, leak internal documents, or force unauthorized discounts.
3. **Webhook Spoofing**: Fake webhook payloads masquerading as Meta WhatsApp or Stripe payment confirmations.
4. **Data Leakage & PII Exposure**: Accidental logging or transmission of customer credit card numbers, medical history, or authentication keys.

---

## 2. Cryptographic Security Standards

### 2.1 Tamper-Proof Magic-Link Tokens (HMAC-SHA256)
Customer self-service portal links utilize a stateless, cryptographic signature model:

$$\text{Token} = \text{Base64Url}(\text{Payload}) \,\|\, \text{"."} \,\|\, \text{HMAC-SHA256}(\text{Base64Url}(\text{Payload}), \text{PORTAL\_SECRET})$$

```typescript
export function generatePortalToken(appointmentId: string): string {
  const payload = {
    appointmentId,
    exp: Date.now() + 48 * 60 * 60 * 1000 // 48-hour time-to-live
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', config.security.portalSecret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}
```

#### Security Properties
- **Tamper Evident**: Modifying `appointmentId` or `exp` invalidates the signature immediately.
- **Stateless Verification**: The backend validates tokens without database session lookups.
- **Strict Expiration**: Tokens expire automatically after 48 hours.

---

### 2.2 Meta WhatsApp Webhook Signature Verification
All incoming payloads from Meta's Graph API are verified using SHA-256 HMAC digest validation against the configured `WHATSAPP_APP_SECRET`:

```typescript
export function verifyWhatsAppSignature(req: Request, rawBody: Buffer): boolean {
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!signature) return false;

  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', config.integrations.whatsapp.appSecret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(expectedSignature, 'utf8')
  );
}
```
*Note: Uses `crypto.timingSafeEqual` to prevent side-channel timing attacks.*

---

## 3. LLM Guardrails & Anti-Hallucination Architecture

### 3.1 Groundedness Enforcement
- The AI Agent is strictly prohibited from answering out-of-context medical or financial queries.
- Retrieval confidence scores from Atlas Vector Search must exceed $0.50$.
- If cosine similarity $< 0.50$, the system outputs:
  > *"I don't have verified information regarding that service in our clinic records. Would you like me to connect you with our front desk team?"*

### 3.2 Prompt Injection & Jailbreak Shields
- **System Prompt Sandboxing**: Input messages are delimited with structural XML tags (`<user_message>...</user_message>`).
- **Instruction Boundary Enforcement**: Pre-execution filters intercept phrases such as `"Ignore previous instructions"` or `"System prompt reveal"`.
- **Zero Financial Discretion**: The agent is structurally incapable of altering service pricing or waiving mandatory booking deposits.

---

## 4. Privacy & PII Handling
- **Masked Logging**: Customer phone numbers and emails are masked in application logs (e.g., `+91 98*** **432`).
- **Zero Payment Card Storage**: OmniAgent never touches or stores raw credit card numbers; payment deposits are tokenized directly via Stripe Checkout or Razorpay UPI.
- **CORS Restrictions**: Strict origin headers restricting admin API routes to the verified dashboard domain.

---

## 5. Document Cross-References
- System Architecture: [ARCHITECTURE.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/ARCHITECTURE.md)
- Complete REST API: [API.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/API.md)
- Database Schemas: [DATABASE.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/DATABASE.md)
- Testing Suites: [TESTING.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/TESTING.md)
