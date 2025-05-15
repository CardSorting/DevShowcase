import { ProjectProcessingResult } from '../models/ZipProjectModel';
import { InsertProject, Project } from '@shared/schema';

/**
 * Interface for project data repository
 * Following Repository Pattern from DDD
 */
export interface IProjectRepository {
  /**
   * Store project data in the database
   * @param projectData Project data to be stored
   */
  saveProject(projectData: InsertProject): Promise<Project>;
  
  /**
   * Converts processing result to insertable project data
   * @param result Project processing result
   */
  mapToInsertProject(result: ProjectProcessingResult): InsertProject;
}