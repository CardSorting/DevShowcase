import { ProjectRepository } from '../interfaces/ProjectRepository';

/**
 * ToggleProjectLikeCommand
 * Command for toggling project likes following CQRS pattern
 * Single Responsibility Principle (SRP) - SOLID
 */
export class ToggleProjectLikeCommand {
  constructor(private repository: ProjectRepository) {}

  /**
   * Execute the command to toggle a like on a project
   * @param projectId The ID of the project to toggle like status
   * @returns Object indicating whether the project is now liked
   */
  async execute(projectId: number): Promise<{ liked: boolean }> {
    try {
      // Delegate to repository implementation
      return await this.repository.toggleProjectLike(projectId);
    } catch (error) {
      console.error('Error toggling project like:', error);
      throw error;
    }
  }
}