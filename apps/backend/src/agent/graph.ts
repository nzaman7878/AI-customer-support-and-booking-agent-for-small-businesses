import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentStateAnnotation, AgentStateType } from './state.js';
import { triageNode } from './nodes/triage.js';
import { ragNode } from './nodes/ragNode.js';
import { bookingNode } from './nodes/bookingNode.js';
import { escalationNode } from './nodes/escalationNode.js';

// Conditional router function
function routeIntent(state: AgentStateType): string {
  if (state.requiresHumanTakeover || state.detectedIntent === 'escalation') {
    return 'escalation';
  }

  if (['booking_request', 'reschedule', 'cancel'].includes(state.detectedIntent)) {
    return 'booking';
  }

  return 'rag';
}

// Construct the StateGraph
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode('triage', triageNode)
  .addNode('rag', ragNode)
  .addNode('booking', bookingNode)
  .addNode('escalation', escalationNode)
  
  .addEdge(START, 'triage')
  
  .addConditionalEdges('triage', routeIntent, {
    escalation: 'escalation',
    booking: 'booking',
    rag: 'rag',
  })
  
  .addEdge('escalation', END)
  .addEdge('booking', END)
  .addEdge('rag', END);

// Compile the executable workflow
export const agentGraph = workflow.compile();

export async function runAgent(
  inputMessage: string, 
  conversationId: string = 'conv_default',
  channel: 'web' | 'whatsapp' = 'web',
  customerInfo?: { name?: string; phone?: string; email?: string }
): Promise<AgentStateType> {
  const result = await agentGraph.invoke({
    messages: [{ role: 'user', content: inputMessage } as any],
    conversationId,
    channel,
    customerName: customerInfo?.name || 'Customer',
    customerPhone: customerInfo?.phone || '',
    customerEmail: customerInfo?.email || '',
  });

  return result;
}
