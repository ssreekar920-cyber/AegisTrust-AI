import mongoose from "mongoose";
import env from "./env.js";

let memoryServer = null;

export async function connectDB(retries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`✅ mongo connected (${env.MONGO_URI})`);
      return;
    } catch (err) {
      console.warn(`⚠️ Mongo connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }

  // If local/remote mongo failed and we're in development/demo mode, attempt MongoMemoryServer
  console.log("ℹ️ Attempting to start in-memory MongoDB fallback...");
  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`✅ mongo connected (in-memory MongoMemoryServer: ${uri})`);
    return;
  } catch (memErr) {
    console.error("❌ MongoDB connection failed completely.");
    console.error(`Ensure MongoDB is running at ${env.MONGO_URI} or set a valid MONGO_URI in .env.`);
    throw new Error(`Database connection failed: ${memErr.message}`);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

export default connectDB;
