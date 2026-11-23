# Third-Party Integrations Guide
## OmniAgent: Google Calendar, Meta WhatsApp Cloud API & CRM Webhooks

---

## 1. Google Calendar Integration

### 1.1 Authentication & Configuration
OmniAgent integrates with Google Calendar via Google Cloud Service Accounts or OAuth2 client credentials:
- **Scopes Required**: `https://www.googleapis.com/auth/calendar`, `https://www.googleapis.com/auth/calendar.events`
- **Environment Variables**:
  ```env
  GOOGLE_CALENDAR_ID="c_primary_clinic@group.calendar.google.com"
  GOOGLE_SERVICE_ACCOUNT_EMAIL="omniagent-svc@project.iam.gserviceaccount.com"
  GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
  ```

### 1.2 FreeBusy Query Lifecycle
Before presenting booking slots to a customer, the backend queries Google Calendar FreeBusy API:
```typescript
const freebusyResponse = await calendar.freebusy.query({
  requestBody: {
    timeMin: `${dateStr}T09:00:00+05:30`,
    timeMax: `${dateStr}T19:00:00+05:30`,
    items: [{ id: config.integrations.googleCalendar.calendarId }]
  }
});
```
Any busy interval is flagged as `isAvailable: false`, guaranteeing zero calendar collisions.

---

## 2. Meta WhatsApp Cloud API

### 2.1 Webhook Verification & Configuration
Meta Graph API communicates via HTTP webhooks (`GET` for verification challenge, `POST` for inbound messages).

```typescript
// Verification Handshake
router.get('/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.integrations.whatsapp.verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});
```

### 2.2 Outbound Interactive Message Templates
When suggesting booking slots or confirmation buttons, messages are dispatched using Meta's Interactive Button format:
```json
{
  "messaging_product": "whatsapp",
  "to": "+919820055432",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": {
      "text": "Your appointment with Dr. Marcus Vance is confirmed for Wednesday at 3:00 PM."
    },
    "action": {
      "buttons": [
        { "type": "reply", "reply": { "id": "btn_directions", "title": "Get Directions" } },
        { "type": "reply", "reply": { "id": "btn_reschedule", "title": "Reschedule" } }
      ]
    }
  }
}
```

---

## 3. Outbound CRM Webhook Dispatcher

### 3.1 Supported Webhook Events
Whenever key business actions occur, OmniAgent dispatches an outbound HMAC-signed HTTP POST payload to configured webhooks (e.g. Zapier, Make, HubSpot, Slack):
1. `appointment.created`: Dispatched when an appointment is booked or walk-in recorded.
2. `appointment.cancelled`: Dispatched when an appointment is cancelled by customer or staff.
3. `lead.captured`: Dispatched when a high-intent conversation qualifies a new lead.
4. `feedback.promoter`: Dispatched when a patient rates the experience 4 or 5 stars.
5. `feedback.detractor`: Dispatched when a patient submits a negative review (< 3 stars).

### 3.2 Webhook Signature Header
Every dispatched webhook includes an authentication header:
```http
X-Webhook-Signature-256: 4f8b2a19e83d...
X-Webhook-Event: appointment.created
X-Webhook-Timestamp: 1795370087243
```
Recipient services compute `crypto.createHmac('sha256', SECRET).update(rawBody).digest('hex')` to verify payload integrity.

---

## 4. Document Cross-References
- Complete REST API: [API.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/API.md)
- Security Specifications: [AUTH_SECURITY.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/AUTH_SECURITY.md)
- Troubleshooting Guide: [DEBUGGING.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/DEBUGGING.md)
