import { Project, ProjectAttributes } from '../entities/Project';

/**
 * Project Repository Interface
 * Follows Interface Segregation Principle (ISP) - SOLID
 * Responsible for data access operations
 */
export interface ProjectRepositoryOptions {
  sort?: string;
  categories?: string[];
  popularity?: string;
  search?: string;
  page?: number;
  userId?: number;
}

export interface ProjectListResult {
  projects: Project[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  categoryCounts: Record<string, number>;
}

export interface ProjectRepository {
  // Query methods
  getProjects(options: ProjectRepositoryOptions): Promise<ProjectListResult>;
  getProjectById(id: number): Promise<Project | null>;
  getProjectsByCategory(category: string, options?: ProjectRepositoryOptions): Promise<ProjectListResult>;
  getFeaturedProjects(limit?: number): Promise<Project[]>;
  getTrendingProjects(limit?: number): Promise<Project[]>;
  getTopProjects(limit?: number): Promise<Project[]>;
  
  // Command methods
  recordProjectView(projectId: number): Promise<void>;
  toggleProjectLike(projectId: number): Promise<{ liked: boolean }>;
}