import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend folder or workspace root
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || '',
    dbName: process.env.MONGODB_DB_NAME || 'ai_customer_agent',
    vectorIndexName: process.env.MONGODB_VECTOR_INDEX_NAME || 'default_vector_index',
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    chatModel: process.env.CHAT_MODEL || 'gpt-4o-mini',
  },
  google: {
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    serviceAccountPrivateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '',
  },
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'ai_agent_verify_token_123',
  },
  business: {
    name: 'Apex Wellness & Aesthetics Clinic',
    industry: 'clinic' as const,
    timezone: 'Asia/Kolkata',
    operatingHours: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      openTime: '10:00',
      closeTime: '19:00',
      slotDurationMinutes: 30,
    },
    contactEmail: 'support@apexwellness.example',
    contactPhone: '+91 98765 43210',
    currency: 'INR',
  }
};
