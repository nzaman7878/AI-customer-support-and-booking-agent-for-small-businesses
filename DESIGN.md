# UI/UX Design System Specification
## OmniAgent: "Obsidian Autonomous Command" Theme & Component Tokens

---

## 1. Design Philosophy
OmniAgent's interface is built on the **"Obsidian Autonomous Command"** design philosophy—an artisanal, dark-mode-first aesthetic engineered with **Google Stitch MCP** and styled with **Tailwind CSS v4**.

The aesthetic conveys precision, autonomy, and executive authority for high-stakes operational environments (clinics, salons, real estate, advisory). It completely avoids generic SaaS templates in favor of deep obsidian layers, micro-neon indicators, frosted backdrops, and crisp typographic density.

---

## 2. Color Palette & Token Definitions

| Token Category | Hex Value | Semantic Purpose |
| :--- | :--- | :--- |
| **Deep Canvas** | `#030712` (`gray-950`) | Primary viewport background. |
| **Surface Card** | `#0b0f19` / `#0f131d` | Floating card surfaces and control panes. |
| **Obsidian Border** | `#1e293b` (`slate-800`) | Structural dividing lines and modal borders. |
| **Subtle Border** | `#334155` (`slate-700`) | Hovered component borders and separator lines. |
| **Command Indigo** | `#6366f1` (`indigo-500`) | Primary interactive buttons, focus rings, and badges. |
| **Bright Indigo** | `#818cf8` (`indigo-400`) | Active tab highlights, glowing icons, and key metrics. |
| **Success Emerald** | `#10b981` (`emerald-500`) | Real-time session active dots, confirmed bookings. |
| **Caution Amber** | `#f59e0b` (`amber-500`) | Deposit pending states, neutral CSAT ratings. |
| **Alert Rose** | `#ef4444` (`red-500`) | Cancelled slots, human escalation takeover banners. |
| **Muted Text** | `#908fa0` | Secondary labels, descriptions, and timestamps. |
| **High-Contrast Text** | `#ffffff` | Primary headers, values, and button titles. |

---

## 3. Typography & Hierarchy
- **Primary Font Family**: `Inter, system-ui, sans-serif`
  - Used for interface controls, body text, customer messages, and headers.
- **Monospace Font Family**: `JetBrains Mono, ui-monospace, monospace`
  - Used for ISO timestamps, HMAC token signatures, slot time badges, and API JSON inspectors.

```
Header 1 (Page Title):   text-xl sm:text-2xl font-bold text-white tracking-tight
Section Header:          text-base font-semibold text-white tracking-wide
Sub-text / Caption:      text-xs font-normal text-[#908fa0]
Metric Number:           text-2xl sm:text-3xl font-extrabold text-white
Code / Token Span:       font-mono text-xs text-[#818cf8] bg-[#6366f1]/10 px-2 py-0.5 rounded
```

---

## 4. Mobile Responsiveness & Viewport Clamping

### 4.1 Chat Widget Drawer Clamps (`ChatWidget.tsx`)
To ensure seamless execution on small mobile viewports (iOS Safari, Android Chrome), the widget incorporates viewport clamps:
```css
/* Mobile Clamped Drawer */
width: calc(100vw - 2rem);
max-width: 420px;
height: calc(100vh - 5rem);
max-height: 620px;
bottom: 1rem;
right: 1rem;
```
*On larger displays (`sm:`), the anchor relaxes to `bottom-6 right-6` with fixed `420px` width.*

### 4.2 Modal & Table Responsive Wrappers
- **Tables**: Contained in horizontal scrolling wrappers (`overflow-x-auto`) with sticky headers.
- **Modals**: Centered overlays with `max-h-[90vh] overflow-y-auto` and auto-scrolling bodies.

---

## 5. Core Component Anatomy

### 5.1 Status Filter Pills
Multi-select filter chips with active count badges:
```tsx
<button className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-[#6366f1]/15 text-[#818cf8] border-[#6366f1]/40">
  Confirmed (12)
</button>
```

### 5.2 Glowing Metric Cards
Telemetry cards featuring gradient accent borders and live indicators:
```tsx
<div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-5 relative overflow-hidden group hover:border-[#6366f1]/40 transition">
  <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1]/10 rounded-full blur-2xl pointer-events-none" />
  {/* Card Content */}
</div>
```

---

## 6. Document Cross-References
- Product Requirements: [PRD.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/PRD.md)
- System Architecture: [ARCHITECTURE.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/ARCHITECTURE.md)
- Complete REST API: [API.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/API.md)
