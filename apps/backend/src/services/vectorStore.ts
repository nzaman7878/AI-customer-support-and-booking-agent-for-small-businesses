import { DocumentChunk, KnowledgeDocument } from '@ai-agent/shared';
import { getDb, isDbConnected } from '../db/mongo.js';
import { config } from '../config/index.js';
import { generateEmbedding, cosineSimilarity, computeSemanticRelevanceScore } from './embeddings.js';
import { chunkText } from './chunker.js';

export const CONFIDENCE_THRESHOLD = 0.50;

export interface RAGSearchResult {
  chunk: DocumentChunk;
  score: number;
  documentTitle: string;
}

export interface RAGQueryResponse {
  query: string;
  results: RAGSearchResult[];
  topScore: number;
  isGrounded: boolean;
  synthesizedAnswer: string;
  fallbackTriggered: boolean;
}

// In-memory fallback stores
const memoryChunks: (DocumentChunk & { embedding: number[] })[] = [];
const memoryDocuments: KnowledgeDocument[] = [];

/**
 * Ingest and index a knowledge document
 */
export async function indexDocument(
  id: string,
  title: string,
  category: 'faq' | 'pricing' | 'policy' | 'service_catalog',
  content: string
): Promise<{ chunkCount: number; document: KnowledgeDocument }> {
  const rawChunks = chunkText(content, id, title, category);
  const embeddedChunks: (DocumentChunk & { embedding: number[] })[] = [];

  for (const chunk of rawChunks) {
    const embedding = await generateEmbedding(`${chunk.documentTitle}\n${chunk.content}`);
    embeddedChunks.push({
      ...chunk,
      embedding
    });
  }

  const docRecord: KnowledgeDocument = {
    id,
    title,
    category,
    content,
    chunkCount: embeddedChunks.length,
    uploadedAt: new Date().toISOString(),
    status: 'indexed'
  };

  // If connected to MongoDB Atlas
  const db = getDb();
  if (isDbConnected() && db) {
    try {
      const docCollection = db.collection('knowledge_documents');
      const chunkCollection = db.collection('document_chunks');

      await docCollection.updateOne({ id }, { $set: docRecord }, { upsert: true });
      await chunkCollection.deleteMany({ documentId: id });
      if (embeddedChunks.length > 0) {
        await chunkCollection.insertMany(embeddedChunks);
      }
    } catch (err: any) {
      console.error('[VectorStore] Atlas ingestion error:', err.message);
    }
  }

  // Always keep in memory store as fast fallback
  const existingDocIdx = memoryDocuments.findIndex(d => d.id === id);
  if (existingDocIdx >= 0) {
    memoryDocuments[existingDocIdx] = docRecord;
  } else {
    memoryDocuments.push(docRecord);
  }

  // Replace chunks in memory
  const remainingChunks = memoryChunks.filter(c => c.documentId !== id);
  memoryChunks.length = 0;
  memoryChunks.push(...remainingChunks, ...embeddedChunks);

  return {
    chunkCount: embeddedChunks.length,
    document: docRecord
  };
}

/**
 * Query the Vector Store using MongoDB Atlas $vectorSearch or in-memory cosine search
 */
export async function queryVectorStore(
  queryText: string,
  limit: number = 3
): Promise<RAGQueryResponse> {
  const queryEmbedding = await generateEmbedding(queryText);
  let results: RAGSearchResult[] = [];

  const db = getDb();
  if (isDbConnected() && db) {
    try {
      // Atlas $vectorSearch aggregation pipeline
      const chunkCollection = db.collection('document_chunks');
      const pipeline = [
        {
          $vectorSearch: {
            index: config.mongodb.vectorIndexName,
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 50,
            limit
          }
        },
        {
          $project: {
            id: 1,
            documentId: 1,
            documentTitle: 1,
            content: 1,
            category: 1,
            chunkIndex: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ];

      const cursor = chunkCollection.aggregate(pipeline);
      const atlasResults = await cursor.toArray();

      if (atlasResults.length > 0) {
        results = atlasResults.map((r: any) => ({
          chunk: {
            id: r.id,
            documentId: r.documentId,
            documentTitle: r.documentTitle,
            content: r.content,
            category: r.category,
            chunkIndex: r.chunkIndex
          },
          score: r.score,
          documentTitle: r.documentTitle
        }));
      }
    } catch (err: any) {
      console.warn('[VectorStore] Atlas vectorSearch query fallback to in-memory search:', err.message);
    }
  }

  // Fallback to in-memory cosine & semantic relevance search
  if (results.length === 0 && memoryChunks.length > 0) {
    const scored = memoryChunks.map(chunk => {
      const score = computeSemanticRelevanceScore(
        queryText, 
        `${chunk.documentTitle} ${chunk.content}`, 
        queryEmbedding, 
        chunk.embedding
      );
      return {
        chunk: {
          id: chunk.id,
          documentId: chunk.documentId,
          documentTitle: chunk.documentTitle,
          content: chunk.content,
          category: chunk.category,
          chunkIndex: chunk.chunkIndex
        },
        score,
        documentTitle: chunk.documentTitle
      };
    });

    scored.sort((a, b) => b.score - a.score);
    results = scored.slice(0, limit);
  }

  const topScore = results.length > 0 ? results[0].score : 0;
  const isGrounded = topScore >= CONFIDENCE_THRESHOLD;
  const fallbackTriggered = !isGrounded;

  let synthesizedAnswer = '';
  if (fallbackTriggered) {
    synthesizedAnswer = 
      "I don't have this specific information verified in our clinic records. " +
      "Would you like me to connect you with our front desk team or have a specialist give you a call back?";
  } else {
    // Top chunks context
    const context = results.map(r => r.chunk.content).join('\n---\n');
    synthesizedAnswer = `Based on our clinic policies: ${results[0].chunk.content}`;
  }

  return {
    query: queryText,
    results,
    topScore,
    isGrounded,
    synthesizedAnswer,
    fallbackTriggered
  };
}

export function listIndexedDocuments(): KnowledgeDocument[] {
  return memoryDocuments;
}

export function getIndexedChunksCount(): number {
  return memoryChunks.length;
}
