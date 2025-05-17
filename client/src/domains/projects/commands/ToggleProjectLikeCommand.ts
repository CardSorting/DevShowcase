import { ProjectRepository } from '../interfaces/ProjectRepository';

/**
 * Command for toggling project like following CQRS pattern
 * Single Responsibility Principle (SRP) - SOLID
 */
export class ToggleProjectLikeCommand {
  constructor(private repository: ProjectRepository) {}

  async execute(projectId: number): Promise<{ liked: boolean }> {
    return await this.repository.toggleProjectLike(projectId);
  }
}