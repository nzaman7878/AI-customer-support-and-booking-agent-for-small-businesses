import { MongoClient, Db } from 'mongodb';
import { config } from '../config/index.js';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;

export async function connectToDatabase(): Promise<{ isConnected: boolean; message: string }> {
  if (!config.mongodb.uri) {
    console.warn('[MongoDB] MONGODB_URI not provided. Running in local in-memory mock store mode for development.');
    return {
      isConnected: false,
      message: 'Running in in-memory simulation mode (no Atlas URI provided)'
    };
  }

  try {
    client = new MongoClient(config.mongodb.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(config.mongodb.dbName);
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to Atlas database: ${config.mongodb.dbName}`);
    return {
      isConnected: true,
      message: `Connected to ${config.mongodb.dbName}`
    };
  } catch (error: any) {
    console.error('[MongoDB] Connection error:', error.message);
    isConnected = false;
    return {
      isConnected: false,
      message: `Failed to connect: ${error.message}. Falling back to in-memory mode.`
    };
  }
}

export function getDb(): Db | null {
  return db;
}

export function isDbConnected(): boolean {
  return isConnected;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    isConnected = false;
    console.log('[MongoDB] Connection closed.');
  }
}
