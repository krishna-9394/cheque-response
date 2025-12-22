import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in environment variables");
}

client = new MongoClient(uri);
clientPromise = client.connect();

export default clientPromise;


// krishnakumar72480_db_user
// androDEV-9394
// ravi_db
// androDEV-9394