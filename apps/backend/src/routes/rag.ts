import { Router, Request, Response } from 'express';
import { 
  indexDocument, 
  queryVectorStore, 
  listIndexedDocuments, 
  getIndexedChunksCount, 
  deleteDocument,
  getDocumentChunks,
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

// Delete a document and its chunks
router.delete('/documents/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await deleteDocument(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    res.json({
      success: true,
      message: `Document ${id} and all its vector chunks have been removed.`,
      documentId: id
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get chunks for a specific document
router.get('/documents/:id/chunks', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const chunks = getDocumentChunks(id);
    res.json({
      success: true,
      documentId: id,
      count: chunks.length,
      chunks
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
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
