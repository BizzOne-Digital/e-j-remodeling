import "server-only";
import mongoose from "mongoose";

const g = globalThis as typeof globalThis & { _mongo?: Promise<typeof mongoose> | null };
export const isDbConfigured = () => Boolean(process.env.MONGODB_URI);

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  if (!g._mongo) {
    mongoose.set("strictQuery", true);
    g._mongo = mongoose
      .connect(process.env.MONGODB_URI, { bufferCommands: false, maxPoolSize: 10, serverSelectionTimeoutMS: 6000 })
      .catch((e) => { g._mongo = null; throw e; });
  }
  return g._mongo;
}
