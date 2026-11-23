# Complete REST API Reference
## OmniAgent: Public, Internal & Webhook Endpoint Specifications

---

## 1. Overview & General Conventions
- **Base URL**: `http://localhost:3000/api` (Local Dev) / `https://api.yourdomain.com/api` (Production)
- **Content-Type**: `application/json`
- **Error Responses**: All error responses return `{ "success": false, "error": string, "code"?: string }`
- **Date/Time Standard**: ISO 8601 with timezone offset (e.g., `2026-11-25T16:00:00+05:30`)

---

## 2. Ingress & Chat Endpoints

### 2.1 Send Message to AI Agent
`POST /api/chat`
Processes incoming multi-turn user messages from the web widget or client applications.

#### Request Body
```json
{
  "message": "How much does a Hydra-Facial cost and do you have slots tomorrow at 3 PM?",
  "sessionId": "conv_client_98231",
  "selectedLang": "en",
  "customerName": "Elena Rostova",
  "customerPhone": "+91 98200 55432"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "sessionId": "conv_client_98231",
  "response": "The Hydra-Facial is ₹6,500 per session. We have an open slot tomorrow at 3:00 PM with Dr. Marcus Vance in Aesthetics Suite 1.",
  "isHumanTakeover": false,
  "confidenceScore": 0.88,
  "quickReplies": ["Book 3:00 PM", "View Pricing", "Speak to Receptionist"],
  "slots": [
    {
      "time": "3:00 PM",
      "doctor": "Dr. Marcus Vance",
      "chamber": "Aesthetics Suite 1",
      "isoStart": "2026-11-24T15:00:00+05:30"
    }
  ]
}
```

---

## 3. Appointments & Calendar Matrix

### 3.1 Query Available Calendar Slots
`GET /api/appointments/slots?date=YYYY-MM-DD`
Queries Google Calendar FreeBusy and returns available 45-minute slots for the given date.

#### Response (`200 OK`)
```json
{
  "success": true,
  "date": "2026-11-25",
  "count": 14,
  "slots": [
    {
      "startTime": "2026-11-25T10:00:00+05:30",
      "endTime": "2026-11-25T10:45:00+05:30",
      "displayTime": "10:00 AM",
      "isAvailable": true,
      "assignedDoctor": "Dr. Marcus Vance"
    }
  ]
}
```

### 3.2 Create Appointment / Walk-in Booking
`POST /api/appointments`
Creates a confirmed calendar reservation and triggers notifications.

#### Request Body
```json
{
  "customerName": "Aarav Mehta",
  "customerEmail": "aarav.mehta@client.com",
  "customerPhone": "+91 98112 33445",
  "serviceName": "Medical & Longevity Consultation",
  "startTime": "2026-11-25T16:00:00+05:30",
  "endTime": "2026-11-25T16:45:00+05:30",
  "notes": "[Walk-in / Dr. Marcus Vance] Front desk reception walk-in."
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "appointment": {
    "id": "apt_1795370087243",
    "customerName": "Aarav Mehta",
    "serviceName": "Medical & Longevity Consultation",
    "startTime": "2026-11-25T16:00:00+05:30",
    "endTime": "2026-11-25T16:45:00+05:30",
    "status": "confirmed",
    "calendarEventId": "gcal_evt_k891la",
    "createdAt": "2026-11-25T10:30:00.000Z"
  },
  "message": "Appointment successfully confirmed for Aarav Mehta"
}
```

### 3.3 Cancel Appointment
`POST /api/appointments/:id/cancel`
Releases the reserved Google Calendar slot and updates appointment status.

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Appointment apt_1795370087243 successfully cancelled and calendar slot freed.",
  "appointment": {
    "id": "apt_1795370087243",
    "status": "cancelled"
  }
}
```

---

## 4. Self-Service Rescheduling Portal

### 4.1 Verify Magic-Link Token
`GET /api/portal/verify?token=ey...`
Validates HMAC-SHA256 token and returns appointment context.

#### Response (`200 OK`)
```json
{
  "success": true,
  "appointment": {
    "id": "apt_seed_1",
    "customerName": "Elena Rostova",
    "serviceName": "Whole-Body Cryo & Assessment",
    "startTime": "2026-10-02T15:00:00+05:30",
    "status": "confirmed"
  }
}
```

### 4.2 1-Click Slot Reschedule
`POST /api/portal/reschedule`
#### Request Body
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newStartTime": "2026-10-02T10:00:00+05:30",
  "newEndTime": "2026-10-02T10:45:00+05:30"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Appointment rescheduled successfully.",
  "appointment": {
    "id": "apt_seed_1",
    "startTime": "2026-10-02T10:00:00+05:30",
    "status": "confirmed"
  }
}
```

---

## 5. Reputation & Review Funnel

### 5.1 Trigger Post-Visit CSAT Survey
`POST /api/feedback/trigger/:appointmentId`
Dispatches automated feedback request to patient via WhatsApp/Email.

### 5.2 Submit Customer Feedback
`POST /api/feedback/submit`
#### Request Body
```json
{
  "appointmentId": "apt_seed_1",
  "rating": 5,
  "review": "Dr. Marcus was incredible, procedure was painless and quick!"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "category": "promoter",
  "googleMapsUrl": "https://g.page/r/apex-wellness-clinic/review?rating=5",
  "message": "Thank you! Please share your experience on our Google Business Profile."
}
```

---

## 6. Document Cross-References
- System Architecture: [ARCHITECTURE.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/ARCHITECTURE.md)
- Integrations Guide: [INTEGRATIONS.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/INTEGRATIONS.md)
- Security Specifications: [AUTH_SECURITY.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/AUTH_SECURITY.md)
