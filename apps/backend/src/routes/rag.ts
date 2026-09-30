import { Router, Request, Response } from 'express';
import { 
  indexDocument, 
  queryVectorStore, 
  listIndexedDocuments, 
  getIndexedChunksCount, 
  CONFIDENCE_THRESHOLD 
} from '../services/vectorStore.js';

const router = Router();

// List all indexed knowledge documents
router.get('/documents', (req: Request, res: Response) => {
  const documents = listIndexedDocuments();
  res.json({
    success: true,
    totalDocuments: documents.length,
    totalChunks: getIndexedChunksCount(),
    confidenceThreshold: CONFIDENCE_THRESHOLD,
    documents
  });
});

// Upload and index a new document
router.post('/documents/upload', async (req: Request, res: Response) => {
  try {
    const { title, category = 'faq', content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'title and content are required'
      });
    }

    const docId = `doc_${Date.now()}`;
    const result = await indexDocument(docId, title, category, content);

    res.json({
      success: true,
      message: `Document "${title}" indexed successfully with ${result.chunkCount} vector chunks.`,
      document: result.document,
      chunkCount: result.chunkCount
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Query Vector RAG pipeline
router.post('/rag/query', async (req: Request, res: Response) => {
  try {
    const { query, limit = 3 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'query string is required'
      });
    }

    const response = await queryVectorStore(query, limit);

    res.json({
      success: true,
      ...response
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
