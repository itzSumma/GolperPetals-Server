import express, { Request, Response } from "express";
import { Collection } from "mongodb";
import { User, UserSchema } from "../types/index.js";

const router = express.Router();

export const userRoutes = (usersCollection: Collection<User>) => {
  
  // POST: নতুন ইউজার তৈরি করা
  router.post("/", async (req: Request, res: Response) => {
    // ১. Zod ভ্যালিডেশন
    const validation = UserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ 
        message: "Validation Error", 
        errors: validation.error.format() 
      });
    }

    try {
      // ২. সঠিক ডাটা হলে ডাটাবেসে সেভ করুন
      // validation.data এখন টাইপ-সেফ ইউজার অবজেক্ট
      const result = await usersCollection.insertOne(validation.data);
      
      res.status(201).json({ 
        message: "User created successfully", 
        userId: result.insertedId 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to insert user" });
    }
  });

  // এই return টি ফাংশনের সেকেন্ড ব্র্যাকেটের { } ভেতর থাকতে হবে
  return router;
};