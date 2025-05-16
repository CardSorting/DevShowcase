import { Request, Response } from "express";
import {
  UserProjectsCommandService,
  UserProjectsQueryService
} from "../application/UserProjectsService";
import { PostgresUserProjectsRepository } from "../infrastructure/UserProjectsRepository";

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
      
      // Validate user has access to this data
      // In a real application, check if current user is requesting their own data or has admin access
      // For simplicity, we're allowing access in this example
      const requestingUserId = req.user?.id || 0;
      
      if (requestingUserId !== userId && requestingUserId !== 0) {
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
      
      // Validate user has access to this project
      const requestingUserId = req.user?.id || 0;
      
      if (requestingUserId !== userId && requestingUserId !== 0) {
        res.status(403).json({ message: "You don't have permission to access this project" });
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
      
      // Validate user has access to this project
      const requestingUserId = req.user?.id || 0;
      
      if (requestingUserId !== userId && requestingUserId !== 0) {
        res.status(403).json({ message: "You don't have permission to access this project" });
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
      
      // Validate user has access to this project
      const requestingUserId = req.user?.id || 0;
      
      if (requestingUserId !== userId && requestingUserId !== 0) {
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