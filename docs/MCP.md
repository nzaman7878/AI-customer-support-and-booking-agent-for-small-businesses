# Model Context Protocol (MCP) Integration Specification
## OmniAgent: Developer Tools, Server Integrations & Autonomous Tooling

---

## 1. Overview of MCP in OmniAgent
The **Model Context Protocol (MCP)** provides standardized client-server interfaces connecting AI agents to external services, databases, and design systems.

Within the OmniAgent ecosystem, MCP servers augment engineering workflows, database operations, and user interface synthesis.

```
┌────────────────────────────────────────────────────────┐
│                    OmniAgent System                    │
│                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │   Google Stitch MCP   │  │   Neon Postgres MCP   │  │
│  │  (Design & UI Engine) │  │   (Database & SQL)    │  │
│  └───────────────────────┘  └───────────────────────┘  │
│             ▲                           ▲              │
│             └─────────────┬─────────────┘              │
│                           │                            │
│              ┌──────────────────────────┐              │
│              │ LangGraph Agent & Tools  │              │
│              └──────────────────────────┘              │
└────────────────────────────────────────────────────────┘
```

---

## 2. Configured MCP Servers & Tools

### 2.1 Google Stitch MCP Server
- **Purpose**: Generates bespoke, artisanal UI screens and tokens adhering to the "Obsidian Autonomous Command" theme.
- **Capabilities**:
  - `generate_screen`: Synthesizes full responsive Tailwind components avoiding generic SaaS aesthetics.
  - `extract_design_tokens`: Generates hex color scales, font hierarchies, and shadow styles.
  - `audit_contrast`: Verifies WCAG 2.1 Level AA color contrast across dark-mode palettes.

### 2.2 Neon PostgreSQL MCP Server
- **Server Name**: `Neon`
- **Capabilities**:
  - `run_sql`: Executes transactional SQL statements and schema migrations.
  - `describe_table_schema`: Inspects table definitions and relationships.
  - `get_connection_string`: Securely retrieves connection pools for backend microservices.
  - `explain_sql_statement`: Provides query execution plans and index tuning recommendations.

---

## 3. Tool Execution Protocol & Security Boundaries
1. **Sandboxed Context**: MCP tools execute within isolated child processes; tool definitions are verified before execution.
2. **Resource Attribution**: Database queries and external tool invocations carry mandatory audit labels for tracing.
3. **No Credential Exfiltration**: Secrets, API keys, and connection strings are injected via environment variables and never exposed in conversation contexts.

---

## 4. Document Cross-References
- System Architecture: [ARCHITECTURE.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/ARCHITECTURE.md)
- Design Specifications: [DESIGN.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/DESIGN.md)
- Debugging Manual: [DEBUGGING.md](file:///c:/Users/nuruz/Desktop/AI-customer-support-and-booking-agent-for-small-businesses/docs/DEBUGGING.md)
