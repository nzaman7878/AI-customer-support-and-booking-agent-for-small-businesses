import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { connectToDatabase, isDbConnected } from './db/mongo.js';
import ragRouter from './routes/rag.js';
import chatRouter from './routes/chat.js';
import { seedClinicKnowledgeBase } from './services/seedKnowledge.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// RAG and Agent Chat APIs
app.use('/api', ragRouter);
app.use('/api', chatRouter);

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Customer Support & Booking Agent API',
    version: '1.0.0',
    database: {
      connected: isDbConnected(),
      mode: isDbConnected() ? 'mongodb-atlas' : 'in-memory-simulation'
    },
    business: config.business.name
  });
});

// Root ping
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'AI Customer Support & Booking Agent API Gateway is live',
    docs: '/api/health',
    phase: 'Phase 3 active: RAG & Vector Store Operational'
  });
});

// Start Server
async function startServer() {
  await connectToDatabase();
  // Seed initial clinic knowledge documents into RAG
  await seedClinicKnowledgeBase();

  const server = app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 AI Customer Support & Booking API Server is running`);
    console.log(`📡 Port: http://localhost:${config.port}`);
    console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
    console.log(`🏬 Business Target: ${config.business.name}`);
    console.log(`🧠 RAG & Atlas Vector Search: Active`);
    console.log(`=======================================================`);
  });

  const shutdown = async () => {
    console.log('\nShutting down server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();

export default app;
