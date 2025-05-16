/**
 * Project Upload Use Case
 * 
 * Implements the core business logic for project uploads
 * Following Clean Architecture principles with separation of concerns
 */

import { IStorage } from '../../storage';
import path from 'path';
import fs from 'fs/promises';
import { InsertProject } from '@shared/schema';

// Domain-specific interfaces
export interface ProjectUploadDTO {
  title: string;
  description: string;
  category: string;
  zipFilePath: string;
  userId: string;
}

export interface ProjectUploadResult {
  id: number;
  title: string;
  projectUrl: string;
  success: boolean;
  message?: string;
}

/**
 * Use case class for project uploads
 * Implements the Command pattern from CQRS
 */
export class ProjectUploadUseCase {
  constructor(private storage: IStorage) {}

  /**
   * Execute the project upload use case
   * Only authenticated users can upload projects
   */
  async execute(data: ProjectUploadDTO): Promise<ProjectUploadResult> {
    try {
      // Process and extract the project
      const projectDir = path.join(process.cwd(), "projects", Date.now().toString());
      await fs.mkdir(projectDir, { recursive: true });

      // For a real implementation, we would extract the ZIP file here
      // For now, we'll create a simple placeholder
      const indexPath = path.join(projectDir, "index.html");
      await fs.writeFile(indexPath, `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${data.title}</title>
          </head>
          <body>
            <h1>${data.title}</h1>
            <p>${data.description}</p>
            <p>Project by user ${data.userId}</p>
          </body>
        </html>
      `);

      // Create the project in the database with user association
      const projectData: InsertProject = {
        userId: data.userId,
        title: data.title,
        description: data.description,
        category: data.category,
        projectUrl: `/projects/${path.basename(projectDir)}`,
        previewUrl: `/projects/${path.basename(projectDir)}/index.html`,
        zipPath: data.zipFilePath,
      };

      const project = await this.storage.createProject(projectData);

      return {
        id: project.id,
        title: project.title,
        projectUrl: project.projectUrl,
        success: true
      };
    } catch (error) {
      console.error('Project upload error:', error);
      return {
        id: 0,
        title: '',
        projectUrl: '',
        success: false,
        message: `Failed to upload project: ${(error as Error).message}`
      };
    }
  }
}