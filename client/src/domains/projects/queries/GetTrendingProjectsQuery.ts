import { Project } from '../entities/Project';
import { ProjectRepository } from '../interfaces/ProjectRepository';

/**
 * Query for trending projects following CQRS pattern
 * Single Responsibility Principle (SRP) - SOLID
 */
export class GetTrendingProjectsQuery {
  constructor(private repository: ProjectRepository) {}

  async execute(limit: number = 5): Promise<Project[]> {
    return await this.repository.getTrendingProjects(limit);
  }
}