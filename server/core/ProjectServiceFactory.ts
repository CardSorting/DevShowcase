import { IProjectProcessor } from './domain/interfaces/IProjectProcessor';
import { ProjectProcessorService } from './application/services/ProjectProcessorService';
import { ExtractZipService } from './infrastructure/services/ExtractZipService';
import { ProjectRepository } from './infrastructure/repositories/ProjectRepository';
import { HtmlFileProcessor } from './infrastructure/services/HtmlFileProcessor';

/**
 * Factory for creating the Project Service with all dependencies
 * Following Dependency Injection and Abstract Factory patterns
 */
export class ProjectServiceFactory {
  /**
   * Create a new instance of the ProjectProcessor with all dependencies
   */
  static createProjectProcessor(): IProjectProcessor {
    // Create the dependencies
    const zipExtractor = new ExtractZipService();
    const projectRepository = new ProjectRepository();
    const htmlProcessor = new HtmlFileProcessor();
    
    // Create and return the service with injected dependencies
    return new ProjectProcessorService(
      zipExtractor,
      projectRepository,
      htmlProcessor
    );
  }
}