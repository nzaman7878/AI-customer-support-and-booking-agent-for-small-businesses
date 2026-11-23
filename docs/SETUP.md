# System Setup & Local Development Manual
## OmniAgent: Zero-to-One Installation, Configuration & Environment Blueprint

---

## 1. Prerequisites
Ensure your development environment meets the following specifications:
- **Node.js**: `v20.12.0` or higher (LTS recommended)
- **Package Manager**: `npm v10.0.0` or higher
- **Operating System**: macOS, Linux, or Windows (PowerShell / WSL)
- **Git**: `v2.40.0` or higher

---

## 2. Quickstart Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ai-customer-support-agent.git
cd ai-customer-support-agent

# 2. Install monorepo dependencies across all workspaces
npm install

# 3. Create root environment file
cp .env.example .env
```

---

## 3. Environment Variable Configuration

Create `.env` in the root and configure the required variables:

```env
# --- Application Ports ---
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# --- LLM & Agent Framework ---
OPENAI_API_KEY=sk-proj-your-api-key-here
LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=""

# --- MongoDB Atlas Vector Search ---
MONGODB_URI=mongodb+srv://admin:password@cluster.mongodb.net/omniagent?retryWrites=true&w=majority
MONGODB_DB_NAME=omniagent

# --- Security & Cryptography ---
PORTAL_SECRET=super_secret_hmac_sha256_portal_key_minimum_32_chars!

# --- Google Calendar API ---
GOOGLE_CALENDAR_ID=c_clinic_primary@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=omniagent-svc@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# --- Meta WhatsApp Cloud API ---
WHATSAPP_PHONE_NUMBER_ID=109283746592019
WHATSAPP_ACCESS_TOKEN=EAAG...your_long_lived_token...
WHATSAPP_VERIFY_TOKEN=omniagent_webhook_verify_token_2026
WHATSAPP_APP_SECRET=your_meta_app_secret_here

# --- Outbound CRM Webhooks ---
WEBHOOK_TARGET_URL=https://hooks.zapier.com/hooks/catch/12345/abcde/
WEBHOOK_SECRET=crm_outbound_hmac_secret_2026
```

---

## 4. Running the Development Monorepo

Start the microservices using npm workspace commands:

```bash
# Run API Backend (Node.js + Express + LangGraph) on http://localhost:3000
npm run dev --workspace=apps/backend

# Run Admin Dashboard (React 19 + Vite) on http://localhost:5173
npm run dev --workspace=apps/dashboard

# Build Standalone Shadow DOM Embeddable Widget
npm run build --workspace=apps/widget
```

---

## 5. Verification & Baseline Diagnostics

Verify that all subsystems are operating correctly:

```bash
# Execute full monorepo build (TypeScript + Vite bundles)
npm run build

# Run Phase A, B, C, and D audit suites
npm run test:phase-a --workspace=apps/backend
npm run test:phase-b --workspace=apps/backend
npm run test:phase-c --workspace=apps/backend
npm run test:phase-d --workspace=apps/backend

# Run the 20-Scenario Golden Evaluation Suite
npm run test:evals --workspace=apps/backend
```

---

## 6. Document Cross-References
- Product Requirements: [PRD.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/PRD.md)
- Complete Testing Suite: [TESTING.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/TESTING.md)
- Debugging Manual: [DEBUGGING.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/DEBUGGING.md)
