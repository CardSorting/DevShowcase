import { Project, ProjectAttributes } from "../entities/Project";

/**
 * ProjectFactoryAdapter
 * Adapter for creating Project entities from API or form data
 * Follows Adapter pattern to convert between interfaces
 */
export class ProjectFactoryAdapter {
  /**
   * Create a Project entity from API data
   */
  static createFromApi(apiData: any): Project {
    return Project.fromApiResponse(apiData);
  }
  
  /**
   * Create Project entity from form data
   */
  static createFromForm(formData: Partial<ProjectAttributes>): Partial<ProjectAttributes> {
    return {
      ...formData,
      featured: formData.featured || false,
      trending: formData.trending || false,
      views: formData.views || 0,
      likes: formData.likes || 0,
      isLiked: formData.isLiked || false
    };
  }
  
  /**
   * Convert a Project entity to a form representation
   */
  static toFormData(project: Project): Partial<ProjectAttributes> {
    return {
      userId: project.userId,
      username: project.username,
      title: project.title,
      description: project.description,
      category: project.category,
      projectUrl: project.projectUrl,
      previewUrl: project.previewUrl,
      thumbnailUrl: project.thumbnailUrl,
      featured: project.featured,
      trending: project.trending
    };
  }
  
  /**
   * Convert API response data to ProjectListResult format
   */
  static createProjectListFromApi(apiResponse: any): {
    projects: Project[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    categoryCounts: Record<string, number>;
  } {
    return {
      projects: apiResponse.projects.map((p: any) => this.createFromApi(p)),
      totalCount: apiResponse.totalCount || 0,
      totalPages: apiResponse.totalPages || 1,
      currentPage: apiResponse.currentPage || 1,
      categoryCounts: apiResponse.categoryCounts || {}
    };
  }
}