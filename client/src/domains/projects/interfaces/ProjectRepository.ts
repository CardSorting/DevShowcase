import { Project, ProjectCategory, ProjectStatus, ProjectAttributes } from '../entities/Project';

/**
 * ProjectList Result Type
 * Represents the response from list operations with pagination and related metadata
 */
export interface ProjectListResult {
  projects: Project[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  categoryCounts: Record<string, number>;
}

/**
 * Pagination Options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

/**
 * Sorting Options for Projects
 */
export type ProjectSortOption = 'newest' | 'popular' | 'trending' | 'alphabetical';

/**
 * Repository Options for querying projects
 */
export interface ProjectRepositoryOptions {
  pagination?: PaginationOptions;
  sort?: ProjectSortOption;
  search?: string;
  userId?: number;
}

/**
 * ProjectRepository Interface
 * Defines the contract for project data access following the Repository pattern
 */
export interface ProjectRepository {
  /**
   * Get a paginated list of projects with optional filtering
   */
  getProjects(options?: ProjectRepositoryOptions): Promise<ProjectListResult>;
  
  /**
   * Get a single project by ID
   */
  getProjectById(id: number): Promise<Project | null>;
  
  /**
   * Get projects by category
   */
  getProjectsByCategory(category: ProjectCategory, options?: ProjectRepositoryOptions): Promise<ProjectListResult>;
  
  /**
   * Get projects by status (featured, trending, etc.)
   */
  getProjectsByStatus(status: ProjectStatus, options?: ProjectRepositoryOptions): Promise<Project[]>;
  
  /**
   * Get projects by user ID
   */
  getProjectsByUser(userId: number, options?: ProjectRepositoryOptions): Promise<ProjectListResult>;
  
  /**
   * Get recommended projects for a user (or general recommendations if not specified)
   */
  getRecommendedProjects(userId?: number, limit?: number): Promise<Project[]>;
  
  /**
   * Create a new project
   */
  createProject(projectData: Omit<ProjectAttributes, 'id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  
  /**
   * Update an existing project
   */
  updateProject(id: number, projectData: Partial<ProjectAttributes>): Promise<Project | null>;
  
  /**
   * Delete a project
   */
  deleteProject(id: number): Promise<boolean>;
  
  /**
   * Toggle like status for a project
   */
  toggleProjectLike(projectId: number): Promise<{ liked: boolean }>;
  
  /**
   * Record a view for a project
   */
  recordProjectView(projectId: number): Promise<void>;
}