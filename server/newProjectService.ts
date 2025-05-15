import { InsertProject } from '@shared/schema';
import { ProjectServiceFactory } from './core/ProjectServiceFactory';
import { ProjectMetadata } from './core/domain/models/ZipProjectModel';

/**
 * New ProjectService adapter that uses the SOLID architecture
 * while maintaining compatibility with the existing API
 */
class NewProjectService {
  /**
   * Process a ZIP file upload, extract it, and return project metadata
   * @param file Uploaded ZIP file
   * @param metadata Project metadata 
   */
  async processUpload(file: any, metadata: {
    title: string;
    description: string;
    category: string;
    userId: number;
    username: string;
  }): Promise<InsertProject> {
    console.log(`Processing project upload using new SOLID architecture: ${metadata.title}`);
    
    try {
      // Create the project processor through the factory (Dependency Injection)
      const projectProcessor = ProjectServiceFactory.createProjectProcessor();
      
      // Map metadata to domain model
      const projectMetadata: ProjectMetadata = {
        userId: metadata.userId,
        username: metadata.username,
        title: metadata.title,
        description: metadata.description,
        category: metadata.category
      };
      
      // Process the project
      const result = await projectProcessor.processProject(file.path, projectMetadata);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process project');
      }
      
      // Return data in the format expected by the existing API
      return {
        userId: metadata.userId,
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        projectUrl: result.projectUrl,
        previewUrl: result.previewUrl,
        thumbnailUrl: null, // Would be a proper thumbnail in production
        zipPath: ''
      };
    } catch (error) {
      console.error(`Error in new project service:`, error);
      throw error;
    }
  }
}

export const newProjectService = new NewProjectService();