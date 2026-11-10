import mongoose from "mongoose";
import type { Environment } from "./env.js";

export async function connectToDatabase(
  uri: string,
  options: mongoose.ConnectOptions = {},
): Promise<typeof mongoose> {
  if (!uri.trim()) throw new Error("MONGODB_URI is required before connecting to MongoDB.");
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
      ...options,
    });
    console.info("Connected to MongoDB.");
    return mongoose;
  } catch (error) {
    console.error("MongoDB connection failed.");
    throw error;
  }
}

export function connectFromEnvironment(environment: Environment): Promise<typeof mongoose> {
  return connectToDatabase(environment.MONGODB_URI);
}

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect();
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
