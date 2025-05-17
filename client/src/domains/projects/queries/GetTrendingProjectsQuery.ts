import { Project } from '../entities/Project';
import { ProjectRepository } from '../interfaces/ProjectRepository';

/**
 * Query for trending projects following CQRS pattern
 * Single Responsibility Principle (SRP) - SOLID
 */
export class GetTrendingProjectsQuery {
  constructor(private repository: ProjectRepository) {}

  async execute(limit: number = 5): Promise<Project[]> {
    // Use the getProjectsByStatus method to get trending projects
    return await this.repository.getProjectsByStatus('trending', {
      pagination: { page: 1, pageSize: limit }
    });
  }
}