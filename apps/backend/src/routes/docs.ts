import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsDirPath = path.resolve(__dirname, '../../../../docs');
const rootDirPath = path.resolve(__dirname, '../../../../');

const router = Router();

export interface DocMetadata {
  filename: string;
  title: string;
  category: 'specifications' | 'api_integrations' | 'security_ops' | 'production_dev';
  categoryLabel: string;
  description: string;
  readTimeMinutes: number;
}

export const DOCS_REGISTRY: DocMetadata[] = [
  {
    filename: 'PRD.md',
    title: 'Product Requirements Document (PRD)',
    category: 'specifications',
    categoryLabel: 'Core Specifications',
    description: 'Executive summary, target personas, functional requirements, and success metrics.',
    readTimeMinutes: 5
  },
  {
    filename: 'ARCHITECTURE.md',
    title: 'System Architecture Specification',
    category: 'specifications',
    categoryLabel: 'Core Specifications',
    description: 'LangGraph.js state machine, dual-channel ingress, Atlas Vector RAG, and microservices.',
    readTimeMinutes: 8
  },
  {
    filename: 'DESIGN.md',
    title: 'UI/UX Design System Specification',
    category: 'specifications',
    categoryLabel: 'Core Specifications',
    description: 'Obsidian Autonomous Command theme, Tailwind v4 tokens, and mobile drawer clamps.',
    readTimeMinutes: 4
  },
  {
    filename: 'MCP.md',
    title: 'Model Context Protocol (MCP) Guide',
    category: 'specifications',
    categoryLabel: 'Core Specifications',
    description: 'Neon PostgreSQL MCP, Google Stitch design engine, and tool execution protocol.',
    readTimeMinutes: 3
  },
  {
    filename: 'API.md',
    title: 'Complete REST API Reference',
    category: 'api_integrations',
    categoryLabel: 'APIs, Integrations & Data',
    description: 'Exhaustive endpoints for Chat, Appointments, Portal, Feedback, RAG, and Webhooks.',
    readTimeMinutes: 7
  },
  {
    filename: 'INTEGRATIONS.md',
    title: 'Third-Party Integrations Guide',
    category: 'api_integrations',
    categoryLabel: 'APIs, Integrations & Data',
    description: 'Google Calendar FreeBusy, Meta WhatsApp Cloud API, and CRM Webhook dispatchers.',
    readTimeMinutes: 6
  },
  {
    filename: 'DATABASE.md',
    title: 'Database Schemas & Storage',
    category: 'api_integrations',
    categoryLabel: 'APIs, Integrations & Data',
    description: 'MongoDB Atlas operational collections, vector index configuration, and fallbacks.',
    readTimeMinutes: 5
  },
  {
    filename: 'AUTH_SECURITY.md',
    title: 'Authentication & Threat Model',
    category: 'security_ops',
    categoryLabel: 'Security, Testing & Ops',
    description: 'Tamper-proof HMAC-SHA256 magic links, WhatsApp webhook verification, and LLM guardrails.',
    readTimeMinutes: 5
  },
  {
    filename: 'DEBUGGING.md',
    title: 'Debugging & Diagnostic Manual',
    category: 'security_ops',
    categoryLabel: 'Security, Testing & Ops',
    description: 'Troubleshooting runbooks for WhatsApp 403, slot double-booking, and RAG fallbacks.',
    readTimeMinutes: 5
  },
  {
    filename: 'TESTING.md',
    title: 'Testing Strategy & Benchmarks',
    category: 'security_ops',
    categoryLabel: 'Security, Testing & Ops',
    description: '20-Scenario Golden Evaluation benchmark, Phase A-D test suites, and CI/CD pipelines.',
    readTimeMinutes: 6
  },
  {
    filename: 'SETUP.md',
    title: 'System Setup & Local Development',
    category: 'production_dev',
    categoryLabel: 'Setup & Production',
    description: 'Zero-to-one installation, environment variables template, and dev commands.',
    readTimeMinutes: 4
  },
  {
    filename: 'FEATURE_DEVELOPMENT.md',
    title: 'Feature Development Guide',
    category: 'production_dev',
    categoryLabel: 'Setup & Production',
    description: 'Adding new industry verticals, LangGraph tools, webhooks, and eval scenarios.',
    readTimeMinutes: 6
  },
  {
    filename: 'IMPLEMENTATION_PLAN.md',
    title: 'Implementation Blueprint',
    category: 'production_dev',
    categoryLabel: 'Setup & Production',
    description: 'Full architectural analysis, phased milestones, and delivery timeline.',
    readTimeMinutes: 10
  },
  {
    filename: 'PRODUCTION_LAUNCH_ROADMAP.md',
    title: 'Production Launch Roadmap',
    category: 'production_dev',
    categoryLabel: 'Setup & Production',
    description: 'Phased rollout schedule, staging bake periods, and monitoring alert thresholds.',
    readTimeMinutes: 5
  },
  {
    filename: 'PRODUCTION_GO_LIVE_SIGNOFF.md',
    title: 'Production Go-Live Sign-Off',
    category: 'production_dev',
    categoryLabel: 'Setup & Production',
    description: 'Production audit checklist, verification matrix, and stakeholder approvals.',
    readTimeMinutes: 4
  }
];

// Helper to resolve markdown file path safely
function resolveDocPath(filename: string): string | null {
  const sanitized = path.basename(filename);
  const docsPath = path.join(docsDirPath, sanitized);
  if (fs.existsSync(docsPath)) return docsPath;
  const rootPath = path.join(rootDirPath, sanitized);
  if (fs.existsSync(rootPath)) return rootPath;
  return null;
}

// GET /api/docs - List all documentation files
router.get('/docs', (req: Request, res: Response) => {
  const documents = DOCS_REGISTRY.map(doc => {
    const filePath = resolveDocPath(doc.filename);
    const sizeBytes = filePath && fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
    return {
      ...doc,
      exists: Boolean(filePath),
      sizeBytes
    };
  });

  res.json({
    success: true,
    count: documents.length,
    documents
  });
});

// GET /api/docs/:filename - Get a specific documentation markdown content
router.get('/docs/:filename', (req: Request, res: Response) => {
  let filename = req.params.filename as string;
  if (!filename.endsWith('.md')) {
    filename = `${filename}.md`;
  }

  const filePath = resolveDocPath(filename);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: `Documentation file '${filename}' not found.`
    });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const meta = DOCS_REGISTRY.find(d => d.filename.toLowerCase() === filename.toLowerCase()) || {
      filename,
      title: filename.replace('.md', ''),
      category: 'specifications',
      categoryLabel: 'Core Specifications',
      description: 'System documentation file',
      readTimeMinutes: 5
    };

    res.json({
      success: true,
      metadata: meta,
      content
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
