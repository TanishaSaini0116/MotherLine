import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { authenticateToken, generateToken, hashPassword, comparePassword, type AuthRequest } from "./middleware/auth";
import { upload } from "./middleware/upload";
import { insertUserSchema, loginUserSchema, insertWellnessEntrySchema, insertMedicalRecordSchema } from "@shared/types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      
      // Get user with password for authentication
      const userWithPassword = await (storage as any).getUserWithPassword?.(email);
      const user = await storage.getUserByEmail(email);
      
      if (!user || !userWithPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await comparePassword(password, userWithPassword.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Protected routes
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  // Medical records routes
  app.post("/api/medical-records", authenticateToken, upload.single("file"), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const record = await storage.createMedicalRecord({
        userId: req.user!.id,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        downloadUrl: `/uploads/${req.file.filename}`,
      });

      res.status(201).json({
        message: "File uploaded successfully",
        record: {
          ...record,
          previewUrl: `/uploads/${record.fileName}`,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Upload failed" });
    }
  });

  app.get("/api/medical-records", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const records = await storage.getUserMedicalRecords(req.user!.id);
      res.json({ records });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch records" });
    }
  });

  app.delete("/api/medical-records/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteMedicalRecord(id, req.user!.id);
      
      if (!success) {
        return res.status(404).json({ message: "Record not found" });
      }
      
      res.json({ message: "Record deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete record" });
    }
  });

  // Wellness routes
  app.post("/api/wellness", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const entryData = insertWellnessEntrySchema.parse(req.body);
      const entry = await storage.createWellnessEntry({
        ...entryData,
        userId: req.user!.id,
      });
      
      res.status(201).json({
        message: "Wellness entry created successfully",
        entry,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create wellness entry" });
    }
  });

  app.get("/api/wellness", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const entries = await storage.getUserWellnessEntries(req.user!.id);
      res.json({ entries });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch wellness entries" });
    }
  });

  // Health tips endpoint
  app.get("/api/health-tips", (req, res) => {
    const tips = [
      {
        id: 1,
        title: "Stay Hydrated",
        content: "Drinking adequate water supports your body's natural detox processes and helps maintain healthy skin. Aim for 8-10 glasses daily.",
        category: "Nutrition",
      },
      {
        id: 2,
        title: "Regular Exercise",
        content: "Just 30 minutes of moderate exercise daily can improve cardiovascular health and boost your mood through endorphin release.",
        category: "Fitness",
      },
      {
        id: 3,
        title: "Quality Sleep",
        content: "Aim for 7-9 hours of sleep each night. Good sleep hygiene supports immune function and mental clarity.",
        category: "Sleep",
      },
    ];
    
    // Return a random tip
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    res.json({ tip: randomTip });
  });

  const httpServer = createServer(app);
  return httpServer;
}
