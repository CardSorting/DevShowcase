import { Request, Response } from "express";
import {
  UserProjectsCommandService,
  UserProjectsQueryService
} from "../application/UserProjectsService";
import { PostgresUserProjectsRepository } from "../infrastructure/UserProjectsRepository";

// Define the user object type to match what our auth middleware attaches
interface AuthUser {
  id: number;
  userId: number;
  username: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Controller for user projects API using CQRS pattern
 * Responsible for HTTP request handling and response formatting
 */
export class UserProjectsController {
  private queryService: UserProjectsQueryService;
  private commandService: UserProjectsCommandService;

  constructor() {
    // Set up repository and services
    const repository = new PostgresUserProjectsRepository();
    this.queryService = new UserProjectsQueryService(repository);
    this.commandService = new UserProjectsCommandService(repository);
  }

  /**
   * Get all projects for a user with analytics
   */
  async getUserProjects(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      
      // Get the authenticated user
      const currentUser = req.user;
      
      // Check if user is authenticated
      if (!currentUser) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }
      
      // Verify user has access to this data (their own data or admin access)
      const isAdmin = currentUser.role === 'admin';
      const isOwnData = currentUser.userId === userId || currentUser.id === userId;
      
      if (!isOwnData && !isAdmin) {
        res.status(403).json({ message: "You don't have permission to access this user's projects" });
        return;
      }
      
      const projects = await this.queryService.getUserProjects(userId);
      res.json({
        projects,
        totalCount: projects.length
      });
    } catch (error) {
      console.error("Error fetching user projects:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching user projects" 
      });
    }
  }

  /**
   * Get detailed analytics for a specific project
   */
  async getProjectAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      const projectId = parseInt(req.params.projectId, 10);
      
      // Get the authenticated user
      const currentUser = req.user;
      
      // Check if user is authenticated
      if (!currentUser) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }
      
      // Verify user has access to this project
      const isAdmin = currentUser.role === 'admin';
      const isOwnData = currentUser.userId === userId || currentUser.id === userId;
      
      if (!isOwnData && !isAdmin) {
        res.status(403).json({ message: "You don't have permission to access this project's analytics" });
        return;
      }
      
      const analytics = await this.queryService.getProjectAnalytics(projectId, userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching project analytics:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Error fetching project analytics"
      });
    }
  }

  /**
   * Get engagement metrics for a specific project
   */
  async getProjectEngagement(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      const projectId = parseInt(req.params.projectId, 10);
      
      // Get the authenticated user
      const currentUser = req.user;
      
      // Check if user is authenticated
      if (!currentUser) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }
      
      // Verify user has access to this project
      const isAdmin = currentUser.role === 'admin';
      const isOwnData = currentUser.userId === userId || currentUser.id === userId;
      
      if (!isOwnData && !isAdmin) {
        res.status(403).json({ message: "You don't have permission to access this project's engagement metrics" });
        return;
      }
      
      const engagement = await this.queryService.getProjectEngagement(projectId, userId);
      res.json(engagement);
    } catch (error) {
      console.error("Error fetching project engagement:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Error fetching project engagement"
      });
    }
  }

  /**
   * Get a single project with full analytics
   */
  async getProjectWithAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      const projectId = parseInt(req.params.projectId, 10);
      
      // Get the authenticated user
      const currentUser = req.user;
      
      // Check if user is authenticated
      if (!currentUser) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }
      
      // Verify user has access to this project
      const isAdmin = currentUser.role === 'admin';
      const isOwnData = currentUser.userId === userId || currentUser.id === userId;
      
      if (!isOwnData && !isAdmin) {
        res.status(403).json({ message: "You don't have permission to access this project" });
        return;
      }
      
      const project = await this.queryService.getProjectWithAnalytics(projectId, userId);
      res.json(project);
    } catch (error) {
      console.error("Error fetching project with analytics:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Error fetching project with analytics"
      });
    }
  }
}