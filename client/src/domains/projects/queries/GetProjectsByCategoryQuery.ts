import { ProjectRepository, ProjectListResult } from '../interfaces/ProjectRepository';

/**
 * Query for getting projects by category following CQRS pattern
 * Single Responsibility Principle (SRP) - SOLID
 */
export class GetProjectsByCategoryQuery {
  constructor(private repository: ProjectRepository) {}

  async execute(category: string, page: number = 1, limit: number = 10): Promise<ProjectListResult> {
    return await this.repository.getProjectsByCategory(category, {
      page,
      sort: 'popular'
    });
  }
}