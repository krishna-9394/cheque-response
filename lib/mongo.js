import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI not defined in .env");
}

const client = new MongoClient(process.env.MONGODB_URI);

let db;

export async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("billing");
    console.log("MongoDB Connected");

    // Create indexes (run once)
    await db.collection("cheque_responses")
      .createIndex({ cheque_number: 1 }, { unique: true });

    await db.collection("ledgers")
      .createIndex({ name: 1 }, { unique: true });
  }
  return db;
}