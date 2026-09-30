import { Router, Request, Response } from 'express';
import { runAgent } from '../agent/graph.js';

export interface ChatSession {
  id: string;
  name: string;
  phone: string;
  channel: 'whatsapp' | 'web';
  snippet: string;
  time: string;
  sentiment: 'nominal' | 'warning' | 'critical' | 'info';
  sentimentText: string;
  vip: string;
  isHumanTakeover: boolean;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'human_agent';
    content: string;
    timestamp: string;
    thoughts?: string[];
  }>;
}

// Active sessions state for live dashboard monitoring
const activeSessions: ChatSession[] = [
  {
    id: 'sess_1',
    name: 'Elena Rostova',
    phone: '+1 (415) 892-0192',
    channel: 'whatsapp',
    snippet: 'Can I reschedule my Cryotherapy session to tomorrow at 3 PM?',
    time: 'Just now',
    sentiment: 'warning',
    sentimentText: 'Booking pending',
    vip: 'Gold Member',
    isHumanTakeover: false,
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Can I reschedule my Cryotherapy session to tomorrow at 3 PM?',
        timestamp: '2:14 PM'
      },
      {
        id: 'm2',
        role: 'assistant',
        content: 'Hi Elena! I can certainly help with that. Rescheduling within your policy window is free of charge. I have Cryo Chamber B open tomorrow (Friday) at 3:00 PM with Dr. Vance. Would you like me to lock this in?',
        timestamp: '2:15 PM',
        thoughts: [
          '[Triage] Intent detected: APPOINTMENT_RESCHEDULE (Confidence: 0.98)',
          '[Vector RAG] Policy matched: Cancellations/reschedules permitted >4h before slot without fee.',
          '[Google Calendar] Slot Tomorrow 15:00 - 15:45 in Cryo Suite B is AVAILABLE.'
        ]
      }
    ]
  },
  {
    id: 'sess_2',
    name: 'Marcus Sterling',
    phone: '+1 (212) 555-0144',
    channel: 'web',
    snippet: 'I was charged twice on my card and nobody is answering! Speak to a human immediately!',
    time: '8m ago',
    sentiment: 'critical',
    sentimentText: 'Upset customer - needs review',
    vip: 'Standard',
    isHumanTakeover: true,
    messages: [
      {
        id: 'm3',
        role: 'user',
        content: 'I was charged twice on my card and nobody is answering! Speak to a human immediately!',
        timestamp: '2:06 PM'
      },
      {
        id: 'm4',
        role: 'assistant',
        content: 'I completely understand, and I want to make sure this is handled with utmost care. I have paused automated replies and notified our duty manager and clinic director directly. A team member is reviewing our conversation right now and will take over immediately.',
        timestamp: '2:06 PM',
        thoughts: [
          '[Triage ⚠️] High-priority escalation triggered: Customer expressed dissatisfaction (charged twice)',
          '[Human Takeover Protocol 🚨] Autonomous AI execution suspended. Live session flagged in Admin Control Room.'
        ]
      }
    ]
  },
  {
    id: 'sess_3',
    name: 'Dr. Sarah Lin',
    phone: '+1 (650) 412-9901',
    channel: 'whatsapp',
    snippet: 'What are the post-IV therapy hydration care instructions?',
    time: '14m ago',
    sentiment: 'nominal',
    sentimentText: 'FAQ resolved',
    vip: 'Platinum',
    isHumanTakeover: false,
    messages: [
      {
        id: 'm5',
        role: 'user',
        content: 'What are the post-IV therapy hydration care instructions?',
        timestamp: '1:58 PM'
      },
      {
        id: 'm6',
        role: 'assistant',
        content: 'Based on our clinic policies: Drink at least 500ml of room-temperature water with electrolytes over the next 2 hours. Avoid rigorous heat or heavy saunas for 4 hours following infusion.',
        timestamp: '1:59 PM',
        thoughts: [
          '[Triage] Intent classified as: inquiry (Knowledge RAG query)',
          '[Vector RAG ✅] Grounded in document: "Apex Wellness General FAQs, Location & Timings"'
        ]
      }
    ]
  }
];

const router = Router();

// List all active sessions
router.get('/sessions', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: activeSessions.length,
    sessions: activeSessions
  });
});

// Toggle Human Takeover on a session
router.post('/sessions/:id/takeover', (req: Request, res: Response) => {
  const { id } = req.params;
  const { takeover } = req.body;

  const session = activeSessions.find(s => s.id === id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  session.isHumanTakeover = typeof takeover === 'boolean' ? takeover : !session.isHumanTakeover;
  console.log(`[Takeover] Session ${id} human takeover set to: ${session.isHumanTakeover}`);

  res.json({
    success: true,
    session
  });
});

// Send message to session (handles both AI mode and Human takeover reply)
router.post('/sessions/:id/message', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, role = 'human_agent' } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, error: 'content is required' });
  }

  const session = activeSessions.find(s => s.id === id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  const newMsg = {
    id: `m_${Date.now()}`,
    role: role as 'user' | 'assistant' | 'human_agent',
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  session.messages.push(newMsg);
  session.snippet = content;
  session.time = 'Just now';

  // If user message and AI is NOT paused, run agent
  if (role === 'user' && !session.isHumanTakeover) {
    const agentState = await runAgent(content, session.id, session.channel);
    const replyMsg = {
      id: `m_ai_${Date.now()}`,
      role: 'assistant' as const,
      content: agentState.finalResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thoughts: agentState.agentThoughts
    };
    session.messages.push(replyMsg);
    session.snippet = agentState.finalResponse;
    if (agentState.requiresHumanTakeover) {
      session.isHumanTakeover = true;
      session.sentiment = 'critical';
      session.sentimentText = 'Upset customer - needs review';
    }
  }

  res.json({
    success: true,
    session
  });
});

// Standard Chat Endpoint
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationId, channel = 'web', customerInfo } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'message string is required'
      });
    }

    const state = await runAgent(
      message,
      conversationId || `conv_${Date.now()}`,
      channel,
      customerInfo
    );

    res.json({
      success: true,
      response: state.finalResponse,
      detectedIntent: state.detectedIntent,
      sentiment: state.sentiment,
      requiresHumanTakeover: state.requiresHumanTakeover,
      handoffReason: state.handoffReason,
      agentThoughts: state.agentThoughts,
      toolResults: state.toolResults,
      bookingDraft: state.bookingDraft
    });
  } catch (error: any) {
    console.error('[Chat API] Error invoking agent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Real-time SSE Stream Endpoint
router.get('/chat/stream', async (req: Request, res: Response) => {
  const message = req.query.message as string;
  const conversationId = (req.query.conversationId as string) || `conv_${Date.now()}`;
  const channel = (req.query.channel as 'web' | 'whatsapp') || 'web';

  if (!message) {
    return res.status(400).json({ error: 'message query param is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent('status', { message: 'Agent initializing thought graph...' });
    const state = await runAgent(message, conversationId, channel);

    for (const thought of state.agentThoughts) {
      sendEvent('thought', { step: thought });
    }

    sendEvent('answer', {
      response: state.finalResponse,
      detectedIntent: state.detectedIntent,
      requiresHumanTakeover: state.requiresHumanTakeover,
      toolResults: state.toolResults
    });

    sendEvent('done', { completed: true });
    res.end();
  } catch (err: any) {
    sendEvent('error', { error: err.message });
    res.end();
  }
});

export default router;
