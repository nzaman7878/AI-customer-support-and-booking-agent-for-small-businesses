# Database Schemas & Storage Architecture
## OmniAgent: MongoDB Atlas Operational Models & Vector Index Architecture

---

## 1. Database Architecture Overview
OmniAgent utilizes **MongoDB Atlas** as a unified data platform handling both:
1. **Operational Transactions**: Appointments, customer leads, active chat sessions, feedback records, and white-label settings.
2. **Vector Search (RAG)**: High-dimensional vector embeddings stored directly inside the `vectorChunks` collection and indexed via Atlas `$vectorSearch`.

---

## 2. Operational Collections & Schemas

### 2.1 Appointments (`appointments`)
Stores all scheduled, confirmed, and cancelled appointments.
```json
{
  "_id": "ObjectId('6740...b12')",
  "id": "apt_1795370087243",
  "customerName": "Elena Rostova",
  "customerEmail": "elena.rostova@example.com",
  "customerPhone": "+91 98200 55432",
  "serviceName": "Whole-Body Cryo & Assessment",
  "startTime": "2026-11-25T16:00:00+05:30",
  "endTime": "2026-11-25T16:45:00+05:30",
  "status": "confirmed", // "pending_payment" | "confirmed" | "cancelled" | "completed"
  "notes": "[Walk-in / Dr. Marcus Vance] Front desk reception walk-in.",
  "calendarEventId": "gcal_evt_k891la",
  "depositAmount": 500,
  "currency": "INR",
  "createdAt": "2026-11-25T10:30:00.000Z"
}
```

### 2.2 Inbound Leads (`leads`)
Captures inbound inquiries with automated intent qualification.
```json
{
  "_id": "ObjectId('6740...c43')",
  "id": "lead_1795370098451",
  "name": "Chloe Davenport",
  "phone": "+1 (310) 902-3341",
  "email": "chloe.d@example.com",
  "source": "web", // "web" | "whatsapp"
  "interest": "Couples Hyperbaric Oxygen Therapy",
  "qualificationStatus": "qualified", // "new" | "qualified" | "converted" | "dropped"
  "summary": "Inquired about weekend couples HBOT package. High intent.",
  "createdAt": "2026-11-25T11:15:00.000Z"
}
```

### 2.3 Active Chat Sessions (`activeSessions`)
Maintains real-time state for live takeover synchronization.
```json
{
  "_id": "conv_98112_live",
  "sessionId": "conv_98112_live",
  "customerName": "Rahul Sharma",
  "customerPhone": "+91 98112 00000",
  "channel": "whatsapp",
  "isHumanTakeover": false,
  "lastMessage": "Can I get an appointment with Dr. Vance?",
  "lastUpdated": "2026-11-25T12:00:00.000Z",
  "messages": [
    {
      "id": "msg_1",
      "sender": "customer",
      "text": "Hello, do you have any appointments today?",
      "timestamp": "2026-11-25T11:58:00.000Z"
    },
    {
      "id": "msg_2",
      "sender": "ai",
      "text": "We have an open slot today at 4:15 PM with Dr. Ananya Ray.",
      "timestamp": "2026-11-25T11:58:02.000Z"
    }
  ]
}
```

### 2.4 Customer Feedback & CSAT (`feedback`)
Tracks review funnel metrics, promoter routing, and detractor care recovery.
```json
{
  "_id": "ObjectId('6740...e99')",
  "id": "fb_1795370111788_v7r5",
  "appointmentId": "apt_seed_1",
  "customerName": "Elena Rostova",
  "customerPhone": "+91 98200 55432",
  "rating": 5,
  "review": "Wonderful consultation with Dr. Vance. Very clean facility.",
  "category": "promoter", // "promoter" (4-5) | "neutral" (3) | "detractor" (1-2)
  "googleMapsClicked": true,
  "isResolved": true,
  "createdAt": "2026-11-25T14:00:00.000Z"
}
```

---

## 3. Atlas Vector Search Index Configuration

### 3.1 Vector Chunks Schema (`vectorChunks`)
```json
{
  "_id": "ObjectId('6740...f11')",
  "chunkId": "doc_pricing_2026_chunk_1",
  "documentId": "doc_pricing_2026",
  "title": "2026 Medical Clinic Fee Schedule",
  "category": "pricing",
  "content": "Hydra-Facial Deep Cleanse: ₹6,500 per session. Includes salicylic exfoliation...",
  "embedding": [0.0142, -0.0219, 0.0891, "... 1536 float values ..."],
  "tokenCount": 420,
  "createdAt": "2026-11-20T08:00:00.000Z"
}
```

### 3.2 Atlas Vector Search Index Definition (`vector_index`)
Created in MongoDB Atlas Search index builder:
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "category"
    },
    {
      "type": "filter",
      "path": "documentId"
    }
  ]
}
```

---

## 4. In-Memory Fallback & Offline Development
For local offline development and test environments where MongoDB Atlas is not directly connected, the backend automatically maintains an synchronized in-memory database store with exact schema parity, enabling full offline testing with `npm test`.

---

## 5. Document Cross-References
- System Architecture: [ARCHITECTURE.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/ARCHITECTURE.md)
- Complete REST API: [API.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/API.md)
- Security Specifications: [AUTH_SECURITY.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/AUTH_SECURITY.md)
