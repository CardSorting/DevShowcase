import { 
  UserProjectsRepository, 
  UserProjectEntity, 
  ProjectAnalytics, 
  ProjectEngagement, 
  UserId, 
  ProjectId 
} from "../domain/models/UserProjectsModel";

// Application service - Command side (CQRS)
export class UserProjectsCommandService {
  constructor(private repository: UserProjectsRepository) {}

  async deleteProject(projectId: number, userId: number): Promise<boolean> {
    // Validate access using domain rules before deleting
    const project = await this.repository.getProjectById(
      new ProjectId(projectId), 
      new UserId(userId)
    );
    
    if (!project) {
      throw new Error("Project not found or you don't have access");
    }
    
    // Domain logic for deletion would go here
    // For now, we'll delegate to the infrastructure layer
    return true; // Implementation will be provided in the repository
  }
  
  async updateProject(projectId: number, userId: number, data: any): Promise<UserProjectEntity> {
    // Validate access using domain rules before updating
    const project = await this.repository.getProjectById(
      new ProjectId(projectId), 
      new UserId(userId)
    );
    
    if (!project) {
      throw new Error("Project not found or you don't have access");
    }
    
    // Domain logic for update would go here
    // For now, we'll delegate to the infrastructure layer
    return project; // Updated project will be returned by the repository
  }
}

// Application service - Query side (CQRS)
export class UserProjectsQueryService {
  constructor(private repository: UserProjectsRepository) {}

  // Get user's projects with aggregated analytics
  async getUserProjects(userId: number): Promise<UserProjectEntity[]> {
    const userIdValueObject = new UserId(userId);
    return this.repository.getUserProjects(userIdValueObject);
  }

  // Get detailed analytics for a specific project
  async getProjectAnalytics(projectId: number, userId: number): Promise<ProjectAnalytics> {
    const project = await this.repository.getProjectById(
      new ProjectId(projectId), 
      new UserId(userId)
    );
    
    if (!project) {
      throw new Error("Project not found or you don't have access");
    }
    
    return this.repository.getProjectAnalytics(new ProjectId(projectId));
  }

  // Get engagement metrics for a specific project
  async getProjectEngagement(projectId: number, userId: number): Promise<ProjectEngagement> {
    const project = await this.repository.getProjectById(
      new ProjectId(projectId), 
      new UserId(userId)
    );
    
    if (!project) {
      throw new Error("Project not found or you don't have access");
    }
    
    return this.repository.getProjectEngagement(new ProjectId(projectId), new UserId(userId));
  }
  
  // Get single project with full analytics
  async getProjectWithAnalytics(projectId: number, userId: number): Promise<UserProjectEntity> {
    const project = await this.repository.getProjectById(
      new ProjectId(projectId), 
      new UserId(userId)
    );
    
    if (!project) {
      throw new Error("Project not found or you don't have access");
    }
    
    return project;
  }
}