import { 
  ProjectRepository, 
  ProjectListResult, 
  ProjectRepositoryOptions 
} from '../interfaces/ProjectRepository';
import { Project, ProjectCategory, ProjectStatus, ProjectAttributes } from '../entities/Project';
import { queryClient } from '@/lib/queryClient';

/**
 * ApiProjectRepository Implementation
 * Concrete implementation of the ProjectRepository interface using API calls
 */
export class ApiProjectRepository implements ProjectRepository {
  /**
   * Get a paginated list of projects with optional filtering
   */
  async getProjects(options?: ProjectRepositoryOptions): Promise<ProjectListResult> {
    try {
      // Construct query parameters
      const params = new URLSearchParams();
      
      // Add pagination
      if (options?.pagination) {
        params.append('page', options.pagination.page.toString());
        params.append('pageSize', options.pagination.pageSize.toString());
      }
      
      // Add sorting
      if (options?.sort) {
        params.append('sort', options.sort);
      }
      
      // Add search
      if (options?.search) {
        params.append('search', options.search);
      }
      
      // Add user filter
      if (options?.userId) {
        params.append('userId', options.userId.toString());
      }
      
      // Fetch data from API
      const url = `/api/projects?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform API response to domain objects
      return {
        projects: data.projects.map((p: any) => Project.fromApiResponse(p)),
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        categoryCounts: data.categoryCounts || {}
      };
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }
  
  /**
   * Get a single project by ID
   */
  async getProjectById(id: number): Promise<Project | null> {
    try {
      const response = await fetch(`/api/projects/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }
      
      const data = await response.json();
      return Project.fromApiResponse(data);
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get projects by category
   */
  async getProjectsByCategory(category: ProjectCategory, options?: ProjectRepositoryOptions): Promise<ProjectListResult> {
    try {
      // Use the getProjects method but append the category filter
      const params = new URLSearchParams();
      params.append('categories', category);
      
      // Construct query parameters
      if (options?.pagination) {
        params.append('page', options.pagination.page.toString());
        params.append('pageSize', options.pagination.pageSize.toString());
      }
      
      if (options?.sort) {
        params.append('sort', options.sort);
      }
      
      // Fetch data from API
      const url = `/api/projects?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects by category: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform API response to domain objects
      return {
        projects: data.projects.map((p: ProjectAttributes) => Project.fromApiResponse(p)),
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        categoryCounts: data.categoryCounts || {}
      };
    } catch (error) {
      console.error(`Error fetching projects by category ${category}:`, error);
      throw error;
    }
  }
  
  /**
   * Get projects by status (featured, trending, etc.)
   */
  async getProjectsByStatus(status: ProjectStatus, options?: ProjectRepositoryOptions): Promise<Project[]> {
    try {
      // Convert status to API parameters
      const params = new URLSearchParams();
      
      // Add specific status filter
      if (status === 'featured') {
        params.append('featured', 'true');
      } else if (status === 'trending') {
        params.append('trending', 'true');
      } else if (status === 'popular') {
        params.append('popularity', 'high');
      } else if (status === 'new') {
        params.append('sort', 'newest');
      }
      
      // Add pagination
      if (options?.pagination) {
        params.append('page', options.pagination.page.toString());
        params.append('pageSize', options.pagination.pageSize.toString());
      }
      
      // Fetch data from API
      const url = `/api/projects?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects by status: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform API response to domain objects
      return data.projects.map((p: ProjectAttributes) => Project.fromApiResponse(p));
    } catch (error) {
      console.error(`Error fetching projects by status ${status}:`, error);
      throw error;
    }
  }
  
  /**
   * Get projects by user ID
   */
  async getProjectsByUser(userId: number, options?: ProjectRepositoryOptions): Promise<ProjectListResult> {
    try {
      // Use the getProjects method with user filter
      return this.getProjects({
        ...options,
        userId
      });
    } catch (error) {
      console.error(`Error fetching projects by user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get recommended projects for a user (or general recommendations if not specified)
   */
  async getRecommendedProjects(userId?: number, limit: number = 5): Promise<Project[]> {
    try {
      // For now, we'll simulate recommendations by getting popular projects
      // In a real implementation, this would call a recommendation endpoint
      const params = new URLSearchParams();
      params.append('popularity', 'high');
      params.append('pageSize', limit.toString());
      
      if (userId) {
        params.append('recommended_for', userId.toString());
      }
      
      const url = `/api/projects?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recommended projects: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform API response to domain objects
      return data.projects.map((p: ProjectAttributes) => Project.fromApiResponse(p));
    } catch (error) {
      console.error("Error fetching recommended projects:", error);
      throw error;
    }
  }
  
  /**
   * Create a new project
   */
  async createProject(projectData: Omit<ProjectAttributes, 'id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
      }
      
      const data = await response.json();
      return Project.fromApiResponse(data);
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }
  
  /**
   * Update an existing project
   */
  async updateProject(id: number, projectData: Partial<ProjectAttributes>): Promise<Project | null> {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH', // Use PATCH for partial updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to update project: ${response.statusText}`);
      }
      
      const data = await response.json();
      return Project.fromApiResponse(data);
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a project
   */
  async deleteProject(id: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Toggle like status for a project
   */
  async toggleProjectLike(projectId: number): Promise<{ liked: boolean }> {
    try {
      const response = await fetch(`/api/projects/${projectId}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to toggle project like: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { liked: data.liked };
    } catch (error) {
      console.error(`Error toggling like for project ${projectId}:`, error);
      throw error;
    }
  }
  
  /**
   * Record a view for a project
   */
  async recordProjectView(projectId: number): Promise<void> {
    try {
      await fetch(`/api/projects/${projectId}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error(`Error recording view for project ${projectId}:`, error);
      // We don't rethrow the error for views, as it's not critical for the user experience
    }
  }
}