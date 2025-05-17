import { Project } from '../entities/Project';
import { ProjectRepository } from '../interfaces/ProjectRepository';

/**
 * Query for featured projects following CQRS pattern
 * Single Responsibility Principle (SRP) - SOLID
 */
export class GetFeaturedProjectsQuery {
  constructor(private repository: ProjectRepository) {}

  async execute(limit: number = 5): Promise<Project[]> {
    return await this.repository.getFeaturedProjects(limit);
  }
}