import { ProjectMetadata, ProjectProcessingResult } from '../models/ZipProjectModel';

/**
 * Interface for project processing services
 * Follows Single Responsibility and Interface Segregation principles
 */
export interface IProjectProcessor {
  /**
   * Process a project upload from a ZIP file
   * @param zipFilePath Path to the uploaded ZIP file
   * @param metadata Project metadata from user input
   */
  processProject(zipFilePath: string, metadata: ProjectMetadata): Promise<ProjectProcessingResult>;
}