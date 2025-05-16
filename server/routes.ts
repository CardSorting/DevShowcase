import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { createServer, Server } from "http";
import { storage } from "./storage";
import { setupSessions, isAuthenticated, login, logout, register, getCurrentUser } from "./auth";
import { projectService } from "./projectService";
import { v4 as uuidv4 } from "uuid";

// Set up multer for file uploads
const upload = multer({
  dest: path.join(process.cwd(), "uploads"),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Helper to get visitor ID for view/like tracking
function getVisitorId(req: Request): string {
  if (!req.session.visitorId) {
    req.session.visitorId = uuidv4();
  }
  return req.session.visitorId;
}

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Set up authentication middleware
  setupSessions(app);

  // Auth routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);
  app.get("/api/auth/logout", logout);
  app.get("/api/auth/user", getCurrentUser);

  // Projects listing with filters and pagination
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const { sort = "newest", category = "", search = "", page = "1", popular = "" } = req.query;
      
      const filters = {
        sort: sort as string,
        categories: category ? [category as string] : [],
        popularity: popular as string,
        search: search as string,
        page: parseInt(page as string, 10) || 1,
        visitorId: getVisitorId(req)
      };
      
      const result = await storage.getProjects(filters);
      res.json(result);
    } catch (error) {
      console.error("Error getting projects:", error);
      res.status(500).json({ message: "Failed to get projects" });
    }
  });

  // Get project by ID
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const project = await storage.getProjectById(id, getVisitorId(req));
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error getting project:", error);
      res.status(500).json({ message: "Failed to get project" });
    }
  });

  // Upload new project
  app.post("/api/projects", isAuthenticated, upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { title, description, category } = req.body;
      
      if (!title || !description || !category) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const user = req.user as any;
      
      // Process the uploaded ZIP file
      const projectData = await projectService.processUpload(req.file, {
        title, 
        description, 
        category,
        userId: user.id,
        username: user.username || 'Anonymous'
      });
      
      // Save to database
      const project = await storage.createProject(projectData);
      
      res.status(201).json({
        id: project.id,
        title: project.title,
        projectUrl: project.projectUrl
      });
    } catch (error) {
      console.error("Error uploading project:", error);
      res.status(500).json({ message: "Failed to upload project" });
    }
  });

  // Record a project view
  app.post("/api/projects/:id/view", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id, 10);
      const visitorId = getVisitorId(req);
      
      await storage.recordProjectView(projectId, visitorId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error recording view:", error);
      res.status(500).json({ message: "Failed to record view" });
    }
  });

  // Toggle like on a project
  app.post("/api/projects/:id/like", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id, 10);
      const visitorId = getVisitorId(req);
      
      const result = await storage.toggleProjectLike(projectId, visitorId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // User projects routes
  app.get("/api/users/:userId/projects", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      // Check if user is requesting their own projects or is an admin
      const user = req.user as any;
      const isOwnProjects = user.id === userId;
      const isAdmin = user.role === 'admin';
      
      if (!isOwnProjects && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const projects = await storage.getProjectsByUser(userId);
      res.json({
        projects,
        totalCount: projects.length
      });
    } catch (error) {
      console.error("Error getting user projects:", error);
      res.status(500).json({ message: "Failed to get user projects" });
    }
  });

  // Get project analytics
  app.get("/api/users/:userId/projects/:projectId/analytics", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const projectId = parseInt(req.params.projectId, 10);
      
      // Check if user is requesting their own project or is an admin
      const user = req.user as any;
      const isOwnProject = user.id === userId;
      const isAdmin = user.role === 'admin';
      
      if (!isOwnProject && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get project first to verify ownership
      const project = await storage.getProjectById(projectId);
      
      if (!project || project.userId !== userId) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get project analytics data
      const analytics = await storage.getProjectAnalytics(projectId);
      res.json(analytics);
    } catch (error) {
      console.error("Error getting project analytics:", error);
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}