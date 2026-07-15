import express, { Request, Response } from "express";
import { Collection } from "mongodb";

const router = express.Router();

export const flowerRoutes = (flowersCollection: Collection) => {
  // সব ফুল পাওয়ার জন্য GET রাউট
  router.get("/", async (req: Request, res: Response) => {
    try {
      const flowers = await flowersCollection.find().toArray();
      res.status(200).json(flowers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flowers" });
    }
  });

  return router;
};