# Stitch Design Specification: Obsidian Autonomous Command

- **Project Title**: AI Customer Support and Booking Agent
- **Stitch Project ID**: `9862873226620657633`
- **Design Theme**: `Obsidian Autonomous Command`
- **Color Mode**: Dark Mode (`#030712` Obsidian Void)
- **Primary Font**: `Plus Jakarta Sans`
- **Telemetry & Trace Font**: `JetBrains Mono`

---

## Generated Screen 1: Admin Command Center
- **Screen ID**: `c6e5992093e84ae5a43c574519e5f0cb`
- **Target**: Desktop (2560 x 2048)
- **Sections**:
  1. **Omnichannel Ingress**: Filterable incoming thread feed (WhatsApp & Web) with live sentiment badges (`Upset customer - needs review`, `Booking pending`, `FAQ resolved`).
  2. **Active Thread & Reasoner**: Customer query stream, multi-stage LangGraph execution accordion (`[Intent Triage]`, `[Vector RAG Retrieval: 89% Cosine Match]`, `[Google Calendar FreeBusy Slot Check]`).
  3. **Human Takeover Switch**: Instant toggle switch with keyboard shortcut (`⌥ + Space`) pausing AI execution and transitioning to manual human agent response mode.
  4. **Telemetry Panel**: Live Atlas Vector embeddings counter, WhatsApp Cloud API webhook status, latency monitor (48ms), and appointment calendar inspector.

---

## Generated Screen 2: Customer AI Concierge Widget
- **Screen ID**: `5b24d83eb61048c5bf7132e36e7dce1f`
- **Target**: Mobile & Embeddable Floating Drawer (780 x 1768)
- **Sections**:
  1. **Concierge Header**: Clinic badge, verified checkmark, animated pulse status (`Online • Avg reply <1s`), minimize & sound controls.
  2. **Conversational Stream**: Welcome message, suggestion pills, reasoning pulse bar (`Checking doctor schedule on Google Calendar...`).
  3. **Interactive Booking Carousel**: Horizontal cards for available time slots with 1-click booking triggers (`Book This Slot`).
  4. **Calendar & WhatsApp Sync**: Provisional hold card with Google Calendar invite generation and instant WhatsApp confirmation toggle.
  5. **Docked Input Bar**: Attachment button, voice dictation mic, text input, send action, and compliance footer.
