import { Router, Request, Response } from 'express';
import { runAgent } from '../agent/graph.js';

const router = Router();

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

// Real-time SSE Stream Endpoint for live widget & dashboard thought inspection
router.get('/chat/stream', async (req: Request, res: Response) => {
  const message = req.query.message as string;
  const conversationId = (req.query.conversationId as string) || `conv_${Date.now()}`;
  const channel = (req.query.channel as 'web' | 'whatsapp') || 'web';

  if (!message) {
    return res.status(400).json({ error: 'message query param is required' });
  }

  // Set SSE Headers
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

    // Stream thoughts sequentially
    for (const thought of state.agentThoughts) {
      sendEvent('thought', { step: thought });
    }

    // Emit final answer
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
