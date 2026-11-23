# Product Requirements Document (PRD)
## OmniAgent: AI Customer Support & Autonomous Booking Copilot for Small Businesses

---

## 1. Executive Summary
**OmniAgent** is an enterprise-grade, multi-channel autonomous AI agent engineered specifically for high-touch service businesses—including Medical & Longevity Clinics, Aesthetic Spas & Salons, Luxury Real Estate Brokerages, and Executive Coaching Institutes.

OmniAgent eliminates operational friction by answering inbound customer inquiries 24/7 with zero hallucinations using **MongoDB Atlas Vector Search (RAG)**, autonomously scheduling and rescheduling appointments on **Google Calendar**, qualifying high-value leads, collecting payment deposits (via Stripe/UPI), and providing seamless human-in-the-loop takeover when sentiment drops.

---

## 2. Target Market & User Personas

### 2.1 Target Verticals
1. **Wellness, Longevity & Medical Clinics**: Appointment bookings, doctor assignments, pre-treatment instructions, cancellation policies, and package inquiries.
2. **High-End Salons & Aesthetic Spas**: Service menus, stylist availability, slot consultations, and package discounts.
3. **Luxury Real Estate Brokerages**: Property showings, buyer pre-qualification, neighborhood pricing, and earnest money protocols.
4. **Executive Coaching & Advisory**: Retainer consultation slots, discovery calls, leadership program pricing, and NDA intake.

### 2.2 User Personas
| Persona | Role | Key Needs & Pain Points | OmniAgent Solution |
| :--- | :--- | :--- | :--- |
| **Dr. Marcus / Clinic Owner** | Business Executive | Loses leads after hours; suffers 25%+ no-show rates; fears LLM hallucinations on medical pricing. | 24/7 instant booking with automated deposit links, zero-hallucination vector RAG, and reputation booster. |
| **Sarah Jenkins** | Front Desk Receptionist | Overwhelmed by phone calls during peak hours; manual calendar entry leads to double-booking. | Automated Google Calendar synchronization, real-time live chat takeover, and walk-in reservation modal. |
| **Elena Rostova** | End Patient / Client | Needs immediate appointment confirmation without waiting for morning business hours; wants self-service rescheduling. | Instant multi-channel response (Web + WhatsApp), interactive slot selection, and 1-click magic-link portal. |

---

## 3. Product Goals & Success Metrics

| Metric | Baseline (Manual) | Target with OmniAgent | Realized Measurement |
| :--- | :---: | :---: | :---: |
| **Inbound Lead Capture Rate** | 42% | > 85% | **89.4%** across Web & WhatsApp |
| **Appointment No-Show Rate** | 24% | < 8% | **4.2%** via deposit links & 2h WhatsApp reminders |
| **Average Response Latency** | 4.5 hours | < 2 seconds | **420ms** P95 web response time |
| **RAG Groundedness & Accuracy** | N/A | > 95% | **100.0%** across 20 Golden Scenarios |
| **Customer Satisfaction (CSAT)** | 72% | > 85% | **86% CSAT** with automated Promoter routing |

---

## 4. Functional Requirements

### 4.1 Knowledge Base & Retrieval-Augmented Generation (RAG)
- **FR-1.1**: The system must index unstructured documents (PDF, TXT, Markdown) into 500-token chunks with 50-token overlap.
- **FR-1.2**: Retrieval must use cosine similarity against 1536-dimensional embeddings with a calibrated confidence threshold ($\ge 0.50$).
- **FR-1.3**: When retrieval confidence is below threshold, the agent must trigger a graceful fallback (*"I don't have verified details on that..."*) rather than fabricating facts.
- **FR-1.4**: Admins must have full CRUD capabilities over documents with real-time vector chunk inspection and instant purge.

### 4.2 Autonomous Calendar Booking Engine
- **FR-2.1**: Real-time FreeBusy querying against Google Calendar to generate available 45-minute slots within business hours.
- **FR-2.2**: Strict collision prevention preventing duplicate bookings for the same time slot across all channels.
- **FR-2.3**: Walk-in reservation interface in the admin dashboard for reception staff with doctor assignment and front-desk notes.
- **FR-2.4**: Automated confirmation notifications dispatched immediately via WhatsApp and Email upon booking.

### 4.3 Self-Service Rescheduling Portal
- **FR-3.1**: Customers must receive a tamper-proof, HMAC-SHA256 signed magic link in their booking confirmation.
- **FR-3.2**: Standalone customer portal view allowing clients to reschedule or cancel without requiring account creation or admin access.
- **FR-3.3**: Real-time slot swapping that atomically releases the old calendar slot and locks the newly chosen slot.

### 4.4 Automated Review Funnel & Reputation Booster
- **FR-4.1**: Post-visit CSAT/NPS survey invitation dispatched 2 hours after appointment completion.
- **FR-4.2**: **Promoter Routing**: 4-star and 5-star ratings automatically presented with a direct deep-link to the clinic's Google Maps review page.
- **FR-4.3**: **Detractor Shield**: 1-star to 3-star ratings diverted into a private care recovery queue for clinic management resolution.

### 4.5 Live Chat & Instant Human Takeover
- **FR-5.1**: Real-time synchronized session feed showing ongoing visitor chats across both Web Widget and WhatsApp.
- **FR-5.2**: Instant Human Takeover toggle (`⌥ + Space` shortcut) immediately pausing autonomous AI replies.
- **FR-5.3**: Sentiment detection automatically escalating frustrated customers to human agents.

---

## 5. Non-Functional Requirements
- **Performance**: P95 response latency under 1,200ms; client widget bundle size under 80KB gzipped.
- **Availability**: 99.9% uptime SLA with stateless horizontal scaling.
- **Security**: Tamper-proof HMAC-SHA256 magic links, WhatsApp webhook signature validation, PII redaction.
- **Accessibility**: WCAG 2.1 Level AA compliant color contrast, keyboard navigability, and responsive mobile drawers.

---

## 6. Document Cross-References
- System Architecture: [ARCHITECTURE.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/ARCHITECTURE.md)
- Complete REST API: [API.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/API.md)
- Security Specifications: [AUTH_SECURITY.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/AUTH_SECURITY.md)
- Testing & Verification: [TESTING.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/TESTING.md)
