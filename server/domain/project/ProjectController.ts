/**
 * Project Controller
 * 
 * Controller layer for handling project-related requests
 * Following Clean Architecture with separation of concerns
 */

import { Request, Response } from 'express';
import { ProjectUploadUseCase } from './ProjectUploadUseCase';
import { storage } from '../../storage';
import * as path from 'path';

/**
 * Controller responsible for handling project-related requests
 * Acts as the interface between the HTTP layer and the domain logic
 */
export class ProjectController {
  private projectUploadUseCase: ProjectUploadUseCase;

  constructor() {
    // Dependency injection of use cases
    this.projectUploadUseCase = new ProjectUploadUseCase(storage);
  }

  /**
   * Handle project upload requests
   * Only authenticated users can upload projects
   */
  async uploadProject(req: Request, res: Response) {
    try {
      // Authentication check is done by middleware
      // We can assume the user is authenticated here
      
      const userId = (req as any).userId;
      const file = req.file;
      const { title, description, category } = req.body;

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      if (!title || !description || !category) {
        return res.status(400).json({ 
          message: 'Missing required fields: title, description, or category'
        });
      }

      // Execute the use case
      const result = await this.projectUploadUseCase.execute({
        title,
        description,
        category,
        zipFilePath: file.path,
        userId
      });

      if (!result.success) {
        return res.status(500).json({ message: result.message });
      }

      return res.status(201).json({
        id: result.id,
        title: result.title,
        projectUrl: result.projectUrl
      });
    } catch (error) {
      console.error('Project upload controller error:', error);
      return res.status(500).json({ 
        message: `Failed to process project upload: ${(error as Error).message}`
      });
    }
  }
}

// Singleton instance
export const projectController = new ProjectController();