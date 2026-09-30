import { config } from '../config/index.js';

export const EMBEDDING_DIMENSION = 1536;

export async function generateEmbedding(text: string): Promise<number[]> {
  // If OpenAI API key is provided
  if (config.ai.openaiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.ai.openaiApiKey}`
        },
        body: JSON.stringify({
          model: config.ai.embeddingModel || 'text-embedding-3-small',
          input: text
        })
      });

      if (response.ok) {
        const json: any = await response.json();
        return json.data[0].embedding;
      } else {
        console.warn('[Embeddings] OpenAI API call failed. Falling back to local semantic vectorizer.');
      }
    } catch (err: any) {
      console.warn('[Embeddings] OpenAI error:', err.message);
    }
  }

  // Deterministic local semantic embedding fallback (normalized 1536-dimensional vector)
  return generateDeterministicSemanticVector(text, EMBEDDING_DIMENSION);
}

/**
 * Deterministic Semantic Vectorizer
 * Generates an L2-normalized 1536-dimensional embedding based on word frequencies,
 * character n-grams, and semantic term weights.
 */
export function generateDeterministicSemanticVector(text: string, dimension: number = 1536): number[] {
  const vector = new Array<number>(dimension).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(w => w.length > 1);

  if (words.length === 0) {
    return vector;
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }

    const index = Math.abs(hash) % dimension;
    // Word position decay factor + word length boost
    const weight = (1.0 + Math.min(word.length / 5, 2.0)) / (1.0 + i * 0.02);
    vector[index] += weight;

    // Bigram semantic tie
    if (i < words.length - 1) {
      const bigram = `${word}_${words[i + 1]}`;
      let bHash = 0;
      for (let c = 0; c < bigram.length; c++) {
        bHash = (bHash << 5) - bHash + bigram.charCodeAt(c);
        bHash |= 0;
      }
      const bIndex = Math.abs(bHash) % dimension;
      vector[bIndex] += 1.5;
    }
  }

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < dimension; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimension; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

/**
 * Compute semantic relevance score between query and document
 * Combines cosine similarity with keyword/n-gram recall to prevent dilution
 */
export function computeSemanticRelevanceScore(
  query: string,
  docText: string,
  queryVec: number[],
  docVec: number[]
): number {
  const cosine = cosineSimilarity(queryVec, docVec);

  // Stop words to filter out
  const stopWords = new Set(['what', 'is', 'the', 'of', 'in', 'and', 'to', 'a', 'an', 'for', 'can', 'i', 'my', 'if', 'this', 'that', 'with', 'on', 'at', 'it', 'do', 'how', 'much', 'does', 'are', 'tell', 'me', 'about']);
  const queryTokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  const docLower = docText.toLowerCase();

  if (queryTokens.length === 0) {
    return cosine;
  }

  let matchCount = 0;
  for (const token of queryTokens) {
    const root = token.length > 5 ? token.slice(0, 5) : token;
    if (docLower.includes(token) || docLower.includes(root)) {
      matchCount++;
    }
  }

  const tokenRecall = matchCount / queryTokens.length;

  // If live OpenAI dense vectors are used, cosine is already 0.75-0.90
  if (config.ai.openaiApiKey) {
    return Math.max(cosine, tokenRecall * 0.9);
  }

  // Local fallback: Weighted hybrid score
  // tokenRecall gives strong signal on key entity matches (e.g. 'hydra-facial', 'reschedule')
  const hybrid = (tokenRecall * 0.85) + (cosine * 0.5);
  return Math.min(1.0, Math.max(0.0, hybrid));
}

/**
 * Cosine similarity between two normalized vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}
