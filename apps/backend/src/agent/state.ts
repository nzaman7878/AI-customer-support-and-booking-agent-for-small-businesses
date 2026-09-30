import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { ChannelType } from '@ai-agent/shared';

export type DetectedIntent = 
  | 'inquiry' 
  | 'booking_request' 
  | 'reschedule' 
  | 'cancel' 
  | 'lead_capture' 
  | 'escalation' 
  | 'unknown';

export type CustomerSentiment = 'positive' | 'neutral' | 'curious' | 'upset' | 'distressed';

export interface BookingDraft {
  serviceName?: string;
  requestedDate?: string; // YYYY-MM-DD
  requestedTime?: string; // HH:mm
  doctorName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  confirmed?: boolean;
}

export const AgentStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, update) => curr.concat(update),
    default: () => [],
  }),
  conversationId: Annotation<string>({
    reducer: (_, update) => update,
    default: () => '',
  }),
  channel: Annotation<ChannelType>({
    reducer: (_, update) => update,
    default: () => 'web',
  }),
  customerName: Annotation<string>({
    reducer: (_, update) => update,
    default: () => 'Customer',
  }),
  customerPhone: Annotation<string>({
    reducer: (_, update) => update,
    default: () => '',
  }),
  customerEmail: Annotation<string>({
    reducer: (_, update) => update,
    default: () => '',
  }),
  detectedIntent: Annotation<DetectedIntent>({
    reducer: (_, update) => update,
    default: () => 'unknown',
  }),
  sentiment: Annotation<CustomerSentiment>({
    reducer: (_, update) => update,
    default: () => 'neutral',
  }),
  requiresHumanTakeover: Annotation<boolean>({
    reducer: (_, update) => update,
    default: () => false,
  }),
  handoffReason: Annotation<string>({
    reducer: (_, update) => update,
    default: () => '',
  }),
  bookingDraft: Annotation<BookingDraft>({
    reducer: (curr, update) => ({ ...curr, ...update }),
    default: () => ({}),
  }),
  agentThoughts: Annotation<string[]>({
    reducer: (curr, update) => curr.concat(update),
    default: () => [],
  }),
  toolResults: Annotation<Record<string, unknown>>({
    reducer: (curr, update) => ({ ...curr, ...update }),
    default: () => ({}),
  }),
  finalResponse: Annotation<string>({
    reducer: (_, update) => update,
    default: () => '',
  }),
});

export type AgentStateType = typeof AgentStateAnnotation.State;
