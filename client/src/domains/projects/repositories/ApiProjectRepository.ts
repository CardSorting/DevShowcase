import { Project, ProjectCategory, ProjectStatus, ProjectAttributes } from '../entities/Project';
import { 
  ProjectRepository, 
  ProjectRepositoryOptions,
  ProjectSortOption,
  PopularityFilter,
  ProjectListResult 
} from '../interfaces/ProjectRepository';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ProjectList } from '@shared/types';

/**
 * API Implementation of Project Repository
 * Follows Dependency Inversion Principle (DIP) and Repository Pattern
 * This implementation adapts the backend API to our domain model
 */
export class ApiProjectRepository implements ProjectRepository {
  /**
   * Builds a query string from repository options
   * Adapts our domain-specific options to the API's expected format
   */
  private buildQueryUrl(options: ProjectRepositoryOptions): string {
    const params = new URLSearchParams();
    
    // Handle sorting
    if (options.sort) {
      // Map domain sort options to API sort parameters
      let sortParam: string;
      switch (options.sort) {
        case 'newest': sortParam = 'created_desc'; break;
        case 'oldest': sortParam = 'created_asc'; break;
        case 'most-viewed': sortParam = 'views'; break;
        case 'most-liked': sortParam = 'likes'; break;
        case 'alphabetical': sortParam = 'alphabetical'; break;
        default: sortParam = 'popular'; break;
      }
      params.append('sort', sortParam);
    }
    
    // Handle category filters
    if (options.categories && options.categories.length > 0) {
      params.append('categories', options.categories.join(','));
    }
    
    // Handle popularity filter
    if (options.popularity) {
      params.append('popularity', options.popularity);
    }
    
    // Handle search query
    if (options.search) {
      params.append('search', options.search);
    }
    
    // Handle pagination
    if (options.pagination) {
      params.append('page', options.pagination.page.toString());
      if (options.pagination.pageSize) {
        params.append('pageSize', options.pagination.pageSize.toString());
      }
    } else if (options.pagination === undefined) {
      // Default to page 1 if not specified
      params.append('page', '1');
    }
    
    // Handle user filter
    if (options.userId) {
      params.append('userId', options.userId.toString());
    }
    
    // Handle date range filters
    if (options.dateRange) {
      if (options.dateRange.startDate) {
        params.append('startDate', options.dateRange.startDate);
      }
      if (options.dateRange.endDate) {
        params.append('endDate', options.dateRange.endDate);
      }
    }
    
    // Handle minimum stats filters
    if (options.minViews) {
      params.append('minViews', options.minViews.toString());
    }
    if (options.minLikes) {
      params.append('minLikes', options.minLikes.toString());
    }
    
    return `/api/projects?${params.toString()}`;
  }

  /**
   * Maps the API response to our domain model
   * Handles transformations between API and domain entities
   */
  private mapToProjectList(data: ProjectList): ProjectListResult {
    // Convert projects to domain entities
    const projects = Project.createMany(data.projects);
    
    // Calculate additional metrics for the UI
    const featuredCount = projects.filter(p => p.featured).length;
    const trendingCount = projects.filter(p => p.trending).length;
    
    // Calculate new projects (less than 7 days old)
    const newCount = projects.filter(p => {
      const createdDate = new Date(p.createdAt);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreation < 7;
    }).length;
    
    return {
      projects,
      totalCount: data.totalCount,
      totalPages: data.totalPages,
      currentPage: data.currentPage,
      categoryCounts: data.categoryCounts,
      // Additional metadata
      featuredCount,
      trendingCount,
      newCount
    };
  }

  /**
   * Get projects with flexible filtering options
   */
  async getProjects(options: ProjectRepositoryOptions = {}): Promise<ProjectListResult> {
    try {
      const url = this.buildQueryUrl(options);
      const response = await apiRequest('GET', url);
      const data = await response.json() as ProjectList;
      
      return this.mapToProjectList(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Return empty result on error
      return {
        projects: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        categoryCounts: {},
        featuredCount: 0,
        trendingCount: 0,
        newCount: 0
      };
    }
  }

  /**
   * Get a single project by ID
   */
  async getProjectById(id: number): Promise<Project | null> {
    try {
      const response = await apiRequest('GET', `/api/projects/${id}`);
      const data = await response.json();
      
      // Record view without affecting the result
      this.recordProjectView(id).catch(err => console.error('Failed to record view:', err));
      
      return Project.create(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  /**
   * Get projects by category
   */
  async getProjectsByCategory(category: ProjectCategory, options: ProjectRepositoryOptions = {}): Promise<ProjectListResult> {
    const updatedOptions = { 
      ...options, 
      categories: [...(options.categories || []), category] 
    };
    
    return this.getProjects(updatedOptions);
  }
  
  /**
   * Get projects by status (featured, trending, new, etc.)
   */
  async getProjectsByStatus(status: ProjectStatus, options: ProjectRepositoryOptions = {}): Promise<Project[]> {
    let updatedOptions: ProjectRepositoryOptions = { ...options };
    
    switch (status) {
      case 'featured':
        updatedOptions.popularity = 'featured';
        break;
      case 'trending':
        updatedOptions.popularity = 'trending';
        break;
      case 'new':
        // For new projects, sort by newest first
        updatedOptions.sort = 'newest';
        updatedOptions.dateRange = {
          // Projects from the last 7 days
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        break;
      default:
        // No special handling for regular status
        break;
    }
    
    const result = await this.getProjects(updatedOptions);
    return result.projects;
  }

  /**
   * Get featured projects
   */
  async getFeaturedProjects(limit = 5): Promise<Project[]> {
    const projects = await this.getProjectsByStatus('featured');
    return projects.slice(0, limit);
  }

  /**
   * Get trending projects
   */
  async getTrendingProjects(limit = 5): Promise<Project[]> {
    const projects = await this.getProjectsByStatus('trending');
    return projects.slice(0, limit);
  }

  /**
   * Get top projects by popularity
   */
  async getTopProjects(limit = 5): Promise<Project[]> {
    const result = await this.getProjects({ 
      sort: 'popular',
      pagination: { page: 1, pageSize: limit }
    });
    return result.projects;
  }
  
  /**
   * Get new projects (created within a specified number of days)
   */
  async getNewProjects(daysSinceCreation = 7, limit = 5): Promise<Project[]> {
    const startDate = new Date(Date.now() - daysSinceCreation * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const result = await this.getProjects({
      sort: 'newest',
      dateRange: { startDate },
      pagination: { page: 1, pageSize: limit }
    });
    
    return result.projects;
  }
  
  /**
   * Get recommended projects based on user preferences
   * If no userId is provided, returns popular projects
   */
  async getRecommendedProjects(userId?: number, limit = 5): Promise<Project[]> {
    // If we have a userId, we would implement sophisticated recommendation logic here
    // For now, just return popular projects as recommendations
    const result = await this.getProjects({ 
      sort: 'popular',
      pagination: { page: 1, pageSize: limit }
    });
    
    return result.projects;
  }
  
  /**
   * Get projects created by a specific user
   */
  async getUserProjects(userId: number, options: ProjectRepositoryOptions = {}): Promise<ProjectListResult> {
    return this.getProjects({
      ...options,
      userId
    });
  }
  
  /**
   * Search projects by text query
   */
  async searchProjects(query: string, options: ProjectRepositoryOptions = {}): Promise<ProjectListResult> {
    return this.getProjects({
      ...options,
      search: query
    });
  }

  /**
   * Record a view for a project
   */
  async recordProjectView(projectId: number): Promise<void> {
    await apiRequest('POST', `/api/projects/${projectId}/view`);
  }

  /**
   * Toggle like status for a project
   */
  async toggleProjectLike(projectId: number): Promise<{ liked: boolean }> {
    const response = await apiRequest('POST', `/api/projects/${projectId}/like`);
    const result = await response.json();
    
    // Invalidate cache for this project and project lists
    queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
    queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    
    return result;
  }
  
  /**
   * Create a new project
   */
  async createProject(project: Omit<ProjectAttributes, 'id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await apiRequest('POST', '/api/projects', project);
    const data = await response.json();
    
    // Invalidate projects list cache
    queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    
    return Project.create(data);
  }
  
  /**
   * Update an existing project
   */
  async updateProject(projectId: number, data: Partial<ProjectAttributes>): Promise<Project | null> {
    try {
      const response = await apiRequest('PATCH', `/api/projects/${projectId}`, data);
      const updatedData = await response.json();
      
      // Invalidate related caches
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      return Project.create(updatedData);
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  }
  
  /**
   * Delete a project
   */
  async deleteProject(projectId: number): Promise<boolean> {
    try {
      await apiRequest('DELETE', `/api/projects/${projectId}`);
      
      // Invalidate related caches
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }
}