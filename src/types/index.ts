import { ObjectId } from "mongodb";
import { z } from "zod";

// ১. আপনার পুরনো ইন্টারফেসটি রাখুন (প্রয়োজন হলে)
export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  createdAt: Date;
}

// ২. Zod স্কিমা তৈরি করুন (যা ডাটা ভ্যালিডেশনের কাজ করবে)
export const UserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  createdAt: z.date().default(() => new Date()), // ডাটা না থাকলে অটো আজকের ডেট সেট হবে
});

// ৩. আপনি যদি চান Zod স্কিমা থেকে অটোমেটিক টাইপ জেনারেট করতে:
// export type User = z.infer<typeof UserSchema>;