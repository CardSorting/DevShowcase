import { Project } from '../entities/Project';
import { 
  ProjectRepository, 
  ProjectRepositoryOptions, 
  ProjectListResult 
} from '../interfaces/ProjectRepository';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ProjectList } from '@shared/types';

/**
 * API Implementation of Project Repository
 * Follows Dependency Inversion Principle (DIP) - SOLID
 */
export class ApiProjectRepository implements ProjectRepository {
  private buildQueryUrl(options: ProjectRepositoryOptions): string {
    const params = new URLSearchParams();
    
    if (options.sort) params.append('sort', options.sort);
    if (options.categories && options.categories.length > 0) {
      params.append('categories', options.categories.join(','));
    }
    if (options.popularity) params.append('popularity', options.popularity);
    if (options.search) params.append('search', options.search);
    if (options.page) params.append('page', options.page.toString());
    if (options.userId) params.append('userId', options.userId.toString());
    
    return `/api/projects?${params.toString()}`;
  }

  private mapToProjectList(data: ProjectList): ProjectListResult {
    return {
      projects: Project.createMany(data.projects),
      totalCount: data.totalCount,
      totalPages: data.totalPages,
      currentPage: data.currentPage,
      categoryCounts: data.categoryCounts
    };
  }

  async getProjects(options: ProjectRepositoryOptions = {}): Promise<ProjectListResult> {
    const url = this.buildQueryUrl(options);
    const response = await apiRequest('GET', url);
    const data = await response.json() as ProjectList;
    
    return this.mapToProjectList(data);
  }

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

  async getProjectsByCategory(category: string, options: ProjectRepositoryOptions = {}): Promise<ProjectListResult> {
    const updatedOptions = { 
      ...options, 
      categories: [...(options.categories || []), category] 
    };
    
    return this.getProjects(updatedOptions);
  }

  async getFeaturedProjects(limit = 5): Promise<Project[]> {
    const result = await this.getProjects({ sort: 'popular' });
    return result.projects
      .filter(project => project.featured)
      .slice(0, limit);
  }

  async getTrendingProjects(limit = 5): Promise<Project[]> {
    const result = await this.getProjects({ sort: 'popular' });
    return result.projects
      .filter(project => project.trending)
      .slice(0, limit);
  }

  async getTopProjects(limit = 5): Promise<Project[]> {
    const result = await this.getProjects({ sort: 'popular' });
    return result.projects.slice(0, limit);
  }

  async recordProjectView(projectId: number): Promise<void> {
    await apiRequest('POST', `/api/projects/${projectId}/view`);
  }

  async toggleProjectLike(projectId: number): Promise<{ liked: boolean }> {
    const response = await apiRequest('POST', `/api/projects/${projectId}/like`);
    const result = await response.json();
    
    // Invalidate cache for this project and project lists
    queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
    queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    
    return result;
  }
}