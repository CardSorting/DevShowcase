import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { projectService } from "./projectService";
import { newProjectService } from "./newProjectService";
import { z } from "zod";
import * as crypto from "crypto";
// We'll implement a simplified auth system first

// File upload configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), "uploads");
      fs.mkdir(uploadDir, { recursive: true })
        .then(() => cb(null, uploadDir))
        .catch(err => cb(err, uploadDir));
    },
    filename: (req, file, cb) => {
      // Create a unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/zip" && !file.originalname.endsWith(".zip")) {
      cb(new Error("Only ZIP files are allowed"));
      return;
    }
    cb(null, true);
  }
});

// Visitor ID generator for tracking views and likes
function getVisitorId(req: Request): string {
  // Use a hash of IP address and user agent as a simple visitor ID
  // In a production app, this would be more sophisticated
  const ip = req.ip || req.socket.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";
  return crypto.createHash("md5").update(`${ip}-${userAgent}`).digest("hex");
}

// Zod schema for project creation
const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description cannot exceed 1000 characters"),
  category: z.enum(["landing-page", "web-app", "portfolio", "game", "ecommerce", "other"], {
    errorMap: () => ({ message: "Invalid category" })
  }),
});

import { NextFunction } from 'express';
import { projectController } from './domain/project/ProjectController';
import { setupAuth, isAuthenticated, login, logout, getCurrentUser } from './simpleAuth';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup paths for project files
  const projectsDir = path.join(process.cwd(), "projects");
  await fs.mkdir(projectsDir, { recursive: true });
  
  // Serve project files
  app.use("/projects", express.static(projectsDir));
  
  // Set up simple authentication
  setupAuth(app);
  
  // API Routes
  
  // Authentication routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/user", isAuthenticated, getCurrentUser);
  
  // Protected Project Upload Route - Only logged-in users can upload projects
  app.post("/api/projects", isAuthenticated, upload.single("file"), 
    (req, res) => projectController.uploadProject(req, res));
  
  // Get all projects with filtering/sorting
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const {
        sort = "popular",
        categories,
        popularity = "any",
        search = "",
        page = "1",
      } = req.query;
      
      let categoriesArray: string[] = [];
      if (categories && typeof categories === "string") {
        categoriesArray = categories.split(",").filter(Boolean);
      }
      
      const visitorId = getVisitorId(req);
      
      const result = await storage.getProjects({
        sort: sort as string,
        categories: categoriesArray,
        popularity: popularity as string,
        search: search as string,
        page: parseInt(page as string, 10),
        visitorId,
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Error fetching projects" });
    }
  });
  
  // Get current user's projects
  app.get("/api/user/projects", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching user projects:", error);
      res.status(500).json({ message: "Failed to fetch your projects" });
    }
  });
  
  // Get project by id
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const visitorId = getVisitorId(req);
      
      const project = await storage.getProjectById(id, visitorId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Error fetching project" });
    }
  });
  
  // Upload project
  app.post("/api/projects", upload.single("file"), async (req: Request, res: Response) => {
    try {
      // Validate file
      if (!req.file) {
        return res.status(400).json({ message: "No ZIP file provided" });
      }
      
      // Validate body
      const result = createProjectSchema.safeParse(req.body);
      if (!result.success) {
        // Clean up uploaded file on validation error
        await fs.unlink(req.file.path);
        return res.status(400).json({ message: result.error.errors[0].message });
      }
      
      const { title, description, category } = result.data;
      
      // Extract and host the project using new SOLID architecture
      const projectData = await newProjectService.processUpload(req.file, {
        title,
        description,
        category,
        userId: 1, // Anonymous user for now
        username: "Anonymous", // Default username
      });
      
      // Store project in the database
      const project = await storage.createProject(projectData);
      
      res.status(201).json({
        id: project.id,
        title: project.title,
        projectUrl: project.projectUrl,
      });
    } catch (error) {
      console.error("Error uploading project:", error);
      // Clean up uploaded file on error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error("Failed to clean up file after error:", cleanupError);
        }
      }
      
      res.status(500).json({ message: error instanceof Error ? error.message : "Error uploading project" });
    }
  });
  
  // Record a view for a project
  app.post("/api/projects/:id/view", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const visitorId = getVisitorId(req);
      
      await storage.recordProjectView(id, visitorId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error recording view:", error);
      res.status(500).json({ message: "Error recording view" });
    }
  });
  
  // Like/unlike a project
  app.post("/api/projects/:id/like", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const visitorId = getVisitorId(req);
      
      const result = await storage.toggleProjectLike(id, visitorId);
      res.status(200).json({ success: true, liked: result.liked });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Error toggling like" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}

// Import express since it's used in the static path declaration
import express from "express";
