export interface DocFile {
  filename: string;
  title: string;
  category: 'specifications' | 'api_integrations' | 'security_ops' | 'production_dev';
  categoryLabel: string;
  description: string;
  readTimeMinutes: number;
  badge?: string;
  tags: string[];
}

export const DOCS_INDEX: DocFile[] = [
  {
    filename: 'PRD.md',
    title: 'Product Requirements Document (PRD)',
    category: 'specifications',
    categoryLabel: 'Core Specifications',
    description: 'Executive summary, target personas, functional requirements, and success metrics.',
    readTimeMinutes: 5,
    badge: 'Core Spec',
    tags: ['PRD', 'Requirements', 'Personas', 'Metrics', 'SLA']
  },
  {
    filename: 'ARCHITECTURE.md',
    title: 'System Architecture Specification',
    category: 'specifications',
    categoryLabel: 'Core Specifications',
    description: 'LangGraph.js state machine, dual-channel ingress, Atlas Vector RAG, and microservices.',
    readTimeMinutes: 8,
    badge: 'System Design',
    tags: ['LangGraph', 'Monorepo', 'RAG', 'State Machine', 'Ingress']
  },
  {
    filename: 'DESIGN.md',
    title: 'UI/UX Design System Specification',
    category: 'specifications',
    categoryLabel: 'Core Specifications',
    description: 'Obsidian Autonomous Command theme, Tailwind v4 tokens, and mobile drawer clamps.',
    readTimeMinutes: 4,
    badge: 'Tailwind v4',
    tags: ['Tailwind v4', 'Google Stitch', 'Obsidian Theme', 'Tokens', 'Responsive']
  },
  {
    filename: 'MCP.md',
    title: 'Model Context Protocol (MCP) Guide',
    category: 'specifications',
    categoryLabel: 'Core Specifications',
    description: 'Neon PostgreSQL MCP, Google Stitch design engine, and tool execution protocol.',
    readTimeMinutes: 3,
    badge: 'Tooling',
    tags: ['MCP', 'Neon Postgres', 'Google Stitch', 'Tool Execution']
  },
  {
    filename: 'API.md',
    title: 'Complete REST API Reference',
    category: 'api_integrations',
    categoryLabel: 'APIs, Integrations & Data',
    description: 'Exhaustive endpoints for Chat, Appointments, Portal, Feedback, RAG, and Webhooks.',
    readTimeMinutes: 7,
    badge: 'REST Endpoints',
    tags: ['REST API', 'Endpoints', 'Schemas', 'JSON', 'Status Codes']
  },
  {
    filename: 'INTEGRATIONS.md',
    title: 'Third-Party Integrations Guide',
    category: 'api_integrations',
    categoryLabel: 'APIs, Integrations & Data',
    description: 'Google Calendar FreeBusy, Meta WhatsApp Cloud API, and CRM Webhook dispatchers.',
    readTimeMinutes: 6,
    badge: 'Google & Meta',
    tags: ['Google Calendar', 'WhatsApp', 'FreeBusy', 'CRM Webhooks', 'Stripe']
  },
  {
    filename: 'DATABASE.md',
    title: 'Database Schemas & Storage',
    category: 'api_integrations',
    categoryLabel: 'APIs, Integrations & Data',
    description: 'MongoDB Atlas operational collections, vector index configuration, and fallbacks.',
    readTimeMinutes: 5,
    badge: 'MongoDB Atlas',
    tags: ['MongoDB', 'Atlas Vector Search', 'Collections', 'Cosine Similarity']
  },
  {
    filename: 'AUTH_SECURITY.md',
    title: 'Authentication & Threat Model',
    category: 'security_ops',
    categoryLabel: 'Security, Testing & Ops',
    description: 'Tamper-proof HMAC-SHA256 magic links, WhatsApp webhook verification, and LLM guardrails.',
    readTimeMinutes: 5,
    badge: 'HMAC-SHA256',
    tags: ['Security', 'HMAC', 'Signatures', 'Guardrails', 'PII', 'CORS']
  },
  {
    filename: 'DEBUGGING.md',
    title: 'Debugging & Diagnostic Manual',
    category: 'security_ops',
    categoryLabel: 'Security, Testing & Ops',
    description: 'Troubleshooting runbooks for WhatsApp 403, slot double-booking, and RAG fallbacks.',
    readTimeMinutes: 5,
    badge: 'Diagnostics',
    tags: ['Debugging', 'Runbooks', 'Troubleshooting', 'Logs', 'Diagnostics']
  },
  {
    filename: 'TESTING.md',
    title: 'Testing Strategy & Benchmarks',
    category: 'security_ops',
    categoryLabel: 'Security, Testing & Ops',
    description: '20-Scenario Golden Evaluation benchmark, Phase A-D test suites, and CI/CD pipelines.',
    readTimeMinutes: 6,
    badge: '100% Pass Rate',
    tags: ['Evals', 'Golden Benchmark', 'Unit Tests', 'CI/CD', 'Regression']
  },
  {
    filename: 'SETUP.md',
    title: 'System Setup & Local Development',
    category: 'production_dev',
    categoryLabel: 'Setup & Production',
    description: 'Zero-to-one installation, environment variables template, and dev commands.',
    readTimeMinutes: 4,
    badge: 'Quickstart',
    tags: ['Setup', 'Installation', 'Environment', 'Local Dev', 'Node.js']
  },
  {
    filename: 'FEATURE_DEVELOPMENT.md',
    title: 'Feature Development Guide',
    category: 'production_dev',
    categoryLabel: 'Setup & Production',
    description: 'Adding new industry verticals, LangGraph tools, webhooks, and eval scenarios.',
    readTimeMinutes: 6,
    badge: 'Extensibility',
    tags: ['Features', 'Tutorials', 'Verticals', 'LangGraph Tools', 'Extensions']
  },
  {
    filename: 'IMPLEMENTATION_PLAN.md',
    title: 'Implementation Blueprint',
    category: 'production_dev',
    categoryLabel: 'Setup & Production',
    description: 'Full architectural analysis, phased milestones, and delivery timeline.',
    readTimeMinutes: 10,
    badge: 'Roadmap',
    tags: ['Blueprint', 'Roadmap', 'Milestones', 'Architecture', 'Phases']
  },
  {
    filename: 'PRODUCTION_LAUNCH_ROADMAP.md',
    title: 'Production Launch Roadmap',
    category: 'production_dev',
    categoryLabel: 'Setup & Production',
    description: 'Phased rollout schedule, staging bake periods, and monitoring alert thresholds.',
    readTimeMinutes: 5,
    badge: 'Deployment',
    tags: ['Launch', 'Staging', 'Rollout', 'Monitoring', 'Alerting']
  },
  {
    filename: 'PRODUCTION_GO_LIVE_SIGNOFF.md',
    title: 'Production Go-Live Sign-Off',
    category: 'production_dev',
    categoryLabel: 'Setup & Production',
    description: 'Production audit checklist, verification matrix, and stakeholder approvals.',
    readTimeMinutes: 4,
    badge: 'Sign-Off Ready',
    tags: ['Sign-Off', 'Readiness', 'Audit', 'Approvals', 'Compliance']
  }
];
