import { AgentStateType } from '../state.js';

export async function escalationNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const thoughts: string[] = [];
  thoughts.push(`[Human Takeover Protocol 🚨] Customer requested human agent or sentiment reached upset threshold.`);
  thoughts.push(`[Human Takeover Protocol ⏸️] Autonomous AI execution suspended. Live session flagged in Admin Control Room.`);

  const finalResponse = 
    `I completely understand, and I want to make sure this is handled with utmost care. ` +
    `I have paused automated replies and notified our duty manager and clinic director directly. ` +
    `A team member is reviewing our conversation right now and will take over immediately. Thank you for your patience!`;

  return {
    agentThoughts: thoughts,
    requiresHumanTakeover: true,
    finalResponse,
  };
}
