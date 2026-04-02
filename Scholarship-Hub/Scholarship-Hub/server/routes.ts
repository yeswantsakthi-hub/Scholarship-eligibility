import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import express from "express";
import fs from "fs";
import bcrypt from "bcryptjs"; // Switched to bcryptjs for simplicity
import session from "express-session";
import createMemoryStore from "memorystore";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const uploader = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const MemoryStore = createMemoryStore(session);

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.use(session({
    secret: process.env.SESSION_SECRET || "super_secret",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000
    }),
    cookie: {
      maxAge: 86400000
    }
  }));

  app.use('/uploads', express.static(uploadDir));

  // Middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(401).json({ message: "Unauthorized: Admins only" });
    }
    next();
  };

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      req.session.userId = user.id;
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);
      if (!user || !(await bcrypt.compare(input.password, user.password))) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.session.userId = user.id;
      res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    res.status(200).json(user);
  });

  // Scholarships
  app.get(api.scholarships.list.path, async (req, res) => {
    const scholarships = await storage.getScholarships();
    res.status(200).json(scholarships);
  });

  app.post(api.scholarships.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.scholarships.create.input.parse(req.body);
      const created = await storage.createScholarship(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.scholarships.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteScholarship(Number(req.params.id));
    res.status(200).json({ message: "Deleted successfully" });
  });

  // Applications
  app.get(api.applications.list.path, requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (user?.isAdmin) {
      const apps = await storage.getApplications();
      res.status(200).json(apps);
    } else {
      const apps = await storage.getApplicationsByStudent(req.session.userId!);
      res.status(200).json(apps);
    }
  });

  app.post(api.applications.create.path, requireAuth, uploader.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Document file is required" });
      }
      const scholarshipId = parseInt(req.body.scholarshipId, 10);
      if (isNaN(scholarshipId)) {
        return res.status(400).json({ message: "Valid scholarshipId is required" });
      }
      
      const documentUrl = `/uploads/${req.file.filename}`;
      
      const app = await storage.createApplication({
        scholarshipId,
        studentId: req.session.userId!,
        documentUrl,
      });
      
      res.status(201).json(app);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.applications.updateStatus.path, requireAdmin, async (req, res) => {
    try {
      const input = api.applications.updateStatus.input.parse(req.body);
      const app = await storage.updateApplicationStatus(Number(req.params.id), input.status, input.remarks);
      res.status(200).json(app);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed data
  setTimeout(async () => {
    try {
      let admin = await storage.getUserByUsername('admin');
      if (!admin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await storage.createUser({
          username: 'admin',
          password: hashedPassword,
          isAdmin: true,
        });
      }
      
      let testUser = await storage.getUserByUsername('student');
      if (!testUser) {
        const hashedPassword = await bcrypt.hash('student123', 10);
        await storage.createUser({
          username: 'student',
          password: hashedPassword,
          isAdmin: false,
        });
      }

      const existingScholarships = await storage.getScholarships();
      if (existingScholarships.length === 0) {
        await storage.createScholarship({
          title: 'Merit Excellence Scholarship',
          description: 'Awarded for outstanding academic achievements.',
          amount: 5000,
          deadline: '2024-12-31'
        });
        await storage.createScholarship({
          title: 'STEM Innovation Grant',
          description: 'For students pursuing degrees in Science and Technology.',
          amount: 7500,
          deadline: '2025-05-15'
        });
      }
    } catch (e) {
      console.error('Failed to seed DB', e);
    }
  }, 1000);

  return httpServer;
}