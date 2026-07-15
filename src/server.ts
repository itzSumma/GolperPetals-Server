import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, Collection } from "mongodb";
import { User } from "./types/index.js";

dotenv.config();

const uri = process.env.MONGODB_URI as string;
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const database = client.db("GolperPetals");
const usersCollection: Collection<User> = database.collection("users");

// ডাটাবেস কানেকশন ফাংশন
async function connectToDatabase(): Promise<void> {
  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // কানেকশন ফেইল করলে সার্ভার বন্ধ করে দেওয়া ভালো
  }
}

// রাউটস
app.post("/users", async (req: Request, res: Response) => {
  try {
    const user: User = req.body;
    const result = await usersCollection.insertOne(user);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to insert user" });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("GolperPetals Server is Running Successfully!");
});

// কানেকশন নিশ্চিত করে সার্ভার রান করা
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
});