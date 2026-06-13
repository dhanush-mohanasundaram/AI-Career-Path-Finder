import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  // Use mongodb-memory-server as fallback when Atlas is unreachable
  let uri = env.MONGODB_URI;

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
    console.log('MongoDB Atlas connected');
    return;
  } catch (err) {
    console.warn('Atlas unreachable, starting in-memory MongoDB…');
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('In-memory MongoDB started (demo mode)');
  } catch (err2) {
    const error = new Error('No MongoDB available: ' + (err2 as Error).message) as Error & { status?: number };
    error.status = 503;
    throw error;
  }
}
