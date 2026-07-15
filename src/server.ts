import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";
import { userRoutes } from "./routes/userRoutes.js"; 
import { flowerRoutes } from "./routes/flowerRoutes.js"; // ১. নতুন রাউট ইমপোর্ট করলাম
import { User } from "./types/index.js";
dotenv.config();

const app = express();
const uri = process.env.MONGODB_URI as string;
const PORT = process.env.PORT || 5000;

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
const usersCollection = database.collection<User>("users");
const flowersCollection = database.collection("flowers"); // ২. ফ্লাওয়ার্সের জন্য কালেকশন তৈরি করলাম

// রাউটসমূহ:
app.use("/users", userRoutes(usersCollection));
app.use("/flowers", flowerRoutes(flowersCollection)); // ৩. ফ্লাওয়ার্স রাউট রেজিস্টার করলাম

app.get("/", (req, res) => {
  res.send("GolperPetals Server is Running Successfully!");
});

async function startServer() {
  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB!");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

startServer();