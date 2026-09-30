import { AgentStateType } from '../state.js';
import { queryVectorStore } from '../../services/vectorStore.js';

export async function ragNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  const query = (lastMessage?.content as string || '').trim();

  const thoughts: string[] = [];
  thoughts.push(`[Vector RAG] Querying Atlas Vector Store: "${query}"`);

  const ragResult = await queryVectorStore(query, 2);

  thoughts.push(`[Vector RAG] Top Match Score: ${(ragResult.topScore * 100).toFixed(1)}% | Grounded: ${ragResult.isGrounded}`);

  let finalResponse = '';

  if (ragResult.fallbackTriggered) {
    thoughts.push(`[Vector RAG 🛡️] Score below confidence threshold. Triggering zero-hallucination fallback.`);
    finalResponse = 
      "I don't have this specific detail verified in our official clinic records. " +
      "Would you like me to connect you with our front desk coordinator or arrange a callback?";
  } else {
    const topChunk = ragResult.results[0];
    thoughts.push(`[Vector RAG ✅] Grounded in document: "${topChunk.documentTitle}"`);

    // Clean synthesis
    finalResponse = 
      `Here is the verified information from our clinic policies:\n\n` +
      `${topChunk.chunk.content}\n\n` +
      `Is there anything else I can check regarding our services or booking a slot for you?`;
  }

  return {
    agentThoughts: thoughts,
    toolResults: { rag: ragResult },
    finalResponse,
  };
}
