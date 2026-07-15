import express, { Request, Response } from "express";
import { Collection, ObjectId } from "mongodb";
import { createAuthToken, hashPassword, verifyAuthToken, verifyPassword } from "../auth.js";
import { LoginSchema, RegisterSchema, User, UserSchema } from "../types/index.js";

const router = express.Router();

function publicUser(user: User) {
  return {
    id: user._id?.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

function getBearerToken(req: Request) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length);
}

export const userRoutes = (usersCollection: Collection<User>) => {
  router.post("/register", async (req: Request, res: Response) => {
    const validation = RegisterSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, name, password } = validation.data;

    try {
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return res.status(409).json({ message: "Email is already registered" });
      }

      const user: User = {
        email,
        name,
        passwordHash: await hashPassword(password),
        createdAt: new Date(),
      };
      const result = await usersCollection.insertOne(user);

      res.status(201).json({
        message: "Registration successful. Please login.",
        user: publicUser({ ...user, _id: result.insertedId }),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  router.post("/login", async (req: Request, res: Response) => {
    const validation = LoginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validation.data;

    try {
      const user = await usersCollection.findOne({ email });

      if (!user?.passwordHash || !user._id) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const passwordMatches = await verifyPassword(password, user.passwordHash);

      if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = await createAuthToken({
        userId: user._id.toString(),
        email: user.email,
      });

      res.status(200).json({
        message: "Login successful",
        token,
        user: publicUser(user),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  router.get("/me", async (req: Request, res: Response) => {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({ message: "Authorization token is required" });
    }

    try {
      const payload = await verifyAuthToken(token);
      const user = await usersCollection.findOne({ _id: new ObjectId(payload.userId) });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ user: publicUser(user) });
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  });

  router.post("/", async (req: Request, res: Response) => {
    const validation = UserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    try {
      const result = await usersCollection.insertOne(validation.data);

      res.status(201).json({
        message: "User created successfully",
        userId: result.insertedId,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to insert user" });
    }
  });

  return router;
};
