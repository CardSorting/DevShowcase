import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { ProjectProcessingResult } from '../../domain/models/ZipProjectModel';
import { InsertProject, Project } from '@shared/schema';
import { storage } from '../../../storage';

/**
 * Implementation of Project Repository
 * Following Repository Pattern
 */
export class ProjectRepository implements IProjectRepository {
  /**
   * Store project data in the database
   * @param projectData Project data to be stored
   */
  async saveProject(projectData: InsertProject): Promise<Project> {
    try {
      console.log('Saving project to database:', projectData.title);
      return await storage.createProject(projectData);
    } catch (error) {
      console.error('Error saving project to database:', error);
      throw error;
    }
  }
  
  /**
   * Converts processing result to insertable project data
   * @param result Project processing result
   */
  mapToInsertProject(result: ProjectProcessingResult): InsertProject {
    return {
      userId: result.metadata.userId,
      title: result.metadata.title,
      description: result.metadata.description,
      category: result.metadata.category,
      projectUrl: result.projectUrl,
      previewUrl: result.previewUrl,
      thumbnailUrl: null, // Would be generated in a production environment
      zipPath: '' // We don't need to store the path in the database
    };
  }
}