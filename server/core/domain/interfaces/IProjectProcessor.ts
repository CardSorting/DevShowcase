import { ProjectMetadata, ProjectProcessingResult } from "../models/ZipProjectModel";

/**
 * Interface for project processing service
 * Following Interface Segregation Principle
 */
export interface IProjectProcessor {
  /**
   * Process a project uploaded as a ZIP file
   * @param zipFilePath Path to the uploaded ZIP file
   * @param metadata Project metadata provided by the user
   * @returns Processing result with project details or error
   */
  processProject(zipFilePath: string, metadata: ProjectMetadata): Promise<ProjectProcessingResult>;
}