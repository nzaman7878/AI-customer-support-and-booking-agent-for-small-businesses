export type ChannelType = 'web' | 'whatsapp';

export type MessageRole = 'user' | 'assistant' | 'system' | 'agent_thought';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  senderName?: string;
  metadata?: {
    channel?: ChannelType;
    thoughtStep?: string;
    toolCall?: {
      name: string;
      args: Record<string, unknown>;
      result?: unknown;
    };
    confidenceScore?: number;
    requiresHumanHandoff?: boolean;
    handoffReason?: string;
  };
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  status: AppointmentStatus;
  notes?: string;
  calendarEventId?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source: ChannelType;
  interest: string;
  qualificationStatus: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  summary: string;
  createdAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  embedding?: number[];
  category?: string;
  chunkIndex: number;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'faq' | 'pricing' | 'policy' | 'service_catalog';
  content: string;
  chunkCount: number;
  uploadedAt: string;
  status: 'indexed' | 'processing' | 'error';
}

export interface BusinessProfile {
  businessName: string;
  industry: 'clinic' | 'salon' | 'real_estate' | 'coaching' | 'general';
  timezone: string;
  operatingHours: {
    days: string[]; // e.g., ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    openTime: string; // "09:00"
    closeTime: string; // "19:00"
    slotDurationMinutes: number; // 30 or 45
  };
  contactEmail: string;
  contactPhone: string;
  currency: string;
}

export interface EvalScenario {
  id: string;
  category: 'knowledge' | 'booking' | 'guardrail' | 'escalation';
  prompt: string;
  expectedBehavior: string;
  expectedTool?: string;
  groundTruth?: string;
}

export interface EvalResult {
  scenarioId: string;
  passed: boolean;
  score: number; // 0.0 - 1.0
  agentResponse: string;
  evaluationRationale: string;
  latencyMs: number;
}
