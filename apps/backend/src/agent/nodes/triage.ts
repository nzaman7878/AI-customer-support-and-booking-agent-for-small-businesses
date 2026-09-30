import { AgentStateType, DetectedIntent, CustomerSentiment } from '../state.js';

export async function triageNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  const text = (lastMessage?.content as string || '').toLowerCase();

  const thoughts: string[] = [];
  thoughts.push(`[Triage] Analyzing message: "${text.slice(0, 60)}..."`);

  // 1. Sentiment & Escalation Detection
  const upsetKeywords = [
    'angry', 'upset', 'furious', 'horrible', 'terrible', 'worst', 
    'charged twice', 'double charged', 'billed twice', 'billed my card twice', 'fraud',
    'scam', 'refund immediately', 'speak to human', 'human agent', 'real human', 
    'human person', 'talk to a human', 'talk to human', 'manager', 'lawyer', 'call me right now', 'complaint'
  ];

  let sentiment: CustomerSentiment = 'neutral';
  let requiresHumanTakeover = false;
  let handoffReason = '';

  const matchedUpset = upsetKeywords.filter(k => text.includes(k));
  if (matchedUpset.length > 0) {
    sentiment = 'upset';
    requiresHumanTakeover = true;
    handoffReason = `Customer expressed dissatisfaction or requested direct human intervention (${matchedUpset.join(', ')})`;
    thoughts.push(`[Triage ⚠️] High-priority escalation triggered: ${handoffReason}`);
  } else if (text.includes('thank') || text.includes('great') || text.includes('awesome') || text.includes('perfect')) {
    sentiment = 'positive';
  } else if (text.includes('?') || text.includes('how') || text.includes('what') || text.includes('is it')) {
    sentiment = 'curious';
  }

  // 2. Intent Categorization
  let detectedIntent: DetectedIntent = 'inquiry';

  if (requiresHumanTakeover) {
    detectedIntent = 'escalation';
  } else if (
    text.includes('policy') || 
    text.includes('how much') || 
    text.includes('cost') || 
    text.includes('price') || 
    text.includes('fee') || 
    text.includes('pricing') || 
    text.includes('discount') || 
    text.includes('refund') || 
    text.includes('hours') || 
    text.includes('parking') || 
    text.includes('insurance') || 
    text.includes('are you open') ||
    text.includes('what happens') ||
    text.includes('if i cancel')
  ) {
    detectedIntent = 'inquiry';
    thoughts.push(`[Triage] Intent classified as: inquiry (Knowledge RAG query)`);
  } else if (text.includes('reschedule') || text.includes('change time') || text.includes('move appointment')) {
    detectedIntent = 'reschedule';
    thoughts.push(`[Triage] Intent classified as: reschedule`);
  } else if (text.includes('cancel') && (text.includes('appointment') || text.includes('booking') || text.includes('session'))) {
    detectedIntent = 'cancel';
    thoughts.push(`[Triage] Intent classified as: cancel`);
  } else if (
    text.includes('book') || 
    text.includes('appointment') || 
    text.includes('schedule') || 
    text.includes('slot') ||
    text.includes('reserve')
  ) {
    detectedIntent = 'booking_request';
    thoughts.push(`[Triage] Intent classified as: booking_request`);
  } else if (text.includes('call me back') || text.includes('reach out to me') || text.includes('my phone')) {
    detectedIntent = 'lead_capture';
    thoughts.push(`[Triage] Intent classified as: lead_capture`);
  } else {
    detectedIntent = 'inquiry';
    thoughts.push(`[Triage] Intent classified as: inquiry (Knowledge RAG query)`);
  }

  return {
    detectedIntent,
    sentiment,
    requiresHumanTakeover,
    handoffReason,
    agentThoughts: thoughts,
  };
}
