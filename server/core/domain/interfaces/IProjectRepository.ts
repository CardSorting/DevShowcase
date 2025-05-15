import { InsertProject, Project } from "@shared/schema";
import { ProjectProcessingResult } from '../models/ZipProjectModel';

/**
 * Interface for project repository
 * Following Repository Pattern and Interface Segregation Principle
 */
export interface IProjectRepository {
  /**
   * Save project data to database
   * @param projectData Project data to be stored
   * @returns Saved project
   */
  saveProject(projectData: InsertProject): Promise<Project>;

  /**
   * Map processing result to insertable project data
   * @param result Project processing result
   * @returns InsertProject data
   */
  mapToInsertProject(result: ProjectProcessingResult): InsertProject;
}