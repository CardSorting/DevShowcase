import { Project, ProjectAttributes, ProjectCategory, ProjectStatus } from '../entities/Project';

/**
 * Project Repository Interface
 * Follows Interface Segregation Principle (ISP) from SOLID
 * Responsible for data access operations
 */

// Sort options for project listings
export type ProjectSortOption = 
  | "popular" 
  | "newest" 
  | "oldest"
  | "most-viewed"
  | "most-liked"
  | "alphabetical";

// Filter options for popularity
export type PopularityFilter = 
  | "any" 
  | "trending" 
  | "featured"
  | "new"
  | "recommended";

// Pagination options with page size
export interface PaginationOptions {
  page: number;
  pageSize?: number;
}

// Comprehensive repository options for advanced filtering and sorting
export interface ProjectRepositoryOptions {
  // Sorting
  sort?: ProjectSortOption;
  
  // Filtering by category
  categories?: ProjectCategory[];
  
  // Filtering by popularity
  popularity?: PopularityFilter;
  
  // Search query
  search?: string;
  
  // Pagination
  pagination?: PaginationOptions;
  
  // Filter by user
  userId?: number;
  
  // Filter by date range
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  
  // Filter by minimum stats
  minViews?: number;
  minLikes?: number;
}

// Result type for project listings with metadata
export interface ProjectListResult {
  projects: Project[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  categoryCounts: Record<string, number>;
  
  // Additional metadata for rich UI
  featuredCount: number;
  trendingCount: number;
  newCount: number;
}

/**
 * ProjectRepository Interface
 * Following Repository Pattern and Interface Segregation Principle
 */
export interface ProjectRepository {
  // Query methods - Read operations following CQRS
  getProjects(options: ProjectRepositoryOptions): Promise<ProjectListResult>;
  getProjectById(id: number): Promise<Project | null>;
  getProjectsByCategory(category: ProjectCategory, options?: ProjectRepositoryOptions): Promise<ProjectListResult>;
  getProjectsByStatus(status: ProjectStatus, options?: ProjectRepositoryOptions): Promise<Project[]>;
  getFeaturedProjects(limit?: number): Promise<Project[]>;
  getTrendingProjects(limit?: number): Promise<Project[]>;
  getTopProjects(limit?: number): Promise<Project[]>;
  getNewProjects(daysSinceCreation?: number, limit?: number): Promise<Project[]>;
  getRecommendedProjects(userId?: number, limit?: number): Promise<Project[]>;
  getUserProjects(userId: number, options?: ProjectRepositoryOptions): Promise<ProjectListResult>;
  searchProjects(query: string, options?: ProjectRepositoryOptions): Promise<ProjectListResult>;
  
  // Command methods - Write operations following CQRS
  recordProjectView(projectId: number): Promise<void>;
  toggleProjectLike(projectId: number): Promise<{ liked: boolean }>;
  createProject(project: Omit<ProjectAttributes, 'id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  updateProject(projectId: number, data: Partial<ProjectAttributes>): Promise<Project | null>;
  deleteProject(projectId: number): Promise<boolean>;
}