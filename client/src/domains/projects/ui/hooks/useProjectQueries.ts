import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Project, ProjectCategory } from '../../entities/Project';
import { 
  ProjectListResult, 
  ProjectRepositoryOptions,
  ProjectSortOption
} from '../../interfaces/ProjectRepository';
import { useProjects } from '../../providers/ProjectsProvider';

/**
 * Custom hook for project queries
 * Uses CQRS pattern to separate query concerns from commands
 */
export function useProjectQueries() {
  const { repository, queries } = useProjects();
  
  // State for category filtering
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | ''>('');
  
  // Define available categories (could come from API)
  const categories: ProjectCategory[] = [
    "JavaScript", 
    "Web App", 
    "Game", 
    "React", 
    "API", 
    "Mobile", 
    "UI/UX", 
    "Library", 
    "Portfolio", 
    "AI"
  ];
  
  // Base options for queries
  const baseOptions: ProjectRepositoryOptions = {
    pagination: { page: 1, pageSize: 24 },
    sort: 'popular'
  };
  
  // Main projects query with filtering
  const {
    data: projectsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/projects', selectedCategory],
    queryFn: async () => {
      if (selectedCategory) {
        return repository.getProjectsByCategory(selectedCategory, baseOptions);
      } else {
        return repository.getProjects(baseOptions);
      }
    }
  });
  
  // Featured projects query
  const { data: featuredProjects = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['/api/projects/featured'],
    queryFn: async () => {
      try {
        return await queries.getFeaturedProjects.execute(5);
      } catch (error) {
        console.error("Error fetching featured projects:", error);
        return [];
      }
    }
  });
  
  // Trending projects query
  const { data: trendingProjects = [], isLoading: isTrendingLoading } = useQuery({
    queryKey: ['/api/projects/trending'],
    queryFn: async () => {
      try {
        return await queries.getTrendingProjects.execute(8);
      } catch (error) {
        console.error("Error fetching trending projects:", error);
        return [];
      }
    }
  });
  
  // Top projects query
  const { data: topProjects = [], isLoading: isTopLoading } = useQuery({
    queryKey: ['/api/projects/top'],
    queryFn: async () => {
      try {
        return await repository.getProjectsByStatus('popular', {
          pagination: { page: 1, pageSize: 5 }
        });
      } catch (error) {
        console.error("Error fetching top projects:", error);
        return [];
      }
    }
  });
  
  // New projects query
  const { data: newProjects = [], isLoading: isNewLoading } = useQuery({
    queryKey: ['/api/projects/new'],
    queryFn: async () => {
      try {
        return await repository.getProjectsByStatus('new', {
          pagination: { page: 1, pageSize: 8 }
        });
      } catch (error) {
        console.error("Error fetching new projects:", error);
        return [];
      }
    }
  });
  
  // Recommended projects query
  const { data: recommendedProjects = [], isLoading: isRecommendedLoading } = useQuery({
    queryKey: ['/api/projects/recommended'],
    queryFn: async () => {
      try {
        return await repository.getRecommendedProjects(undefined, 6);
      } catch (error) {
        console.error("Error fetching recommended projects:", error);
        return [];
      }
    }
  });
  
  /**
   * Function to load project details by ID
   */
  const loadProject = async (id: number): Promise<Project | null> => {
    try {
      const project = await repository.getProjectById(id);
      
      // Record view asynchronously (fire and forget)
      if (project) {
        repository.recordProjectView(id).catch(console.error);
      }
      
      return project;
    } catch (error) {
      console.error(`Error loading project ${id}:`, error);
      return null;
    }
  };
  
  /**
   * Function to search projects with given term
   */
  const searchProjects = async (
    term: string, 
    options: Omit<ProjectRepositoryOptions, 'search'> = {}
  ): Promise<ProjectListResult> => {
    return repository.getProjects({
      ...options,
      search: term
    });
  };
  
  return {
    // Data
    projectsData,
    featuredProjects,
    trendingProjects,
    topProjects,
    newProjects,
    recommendedProjects,
    
    // Loading states
    isLoading,
    error,
    
    // Category filtering
    categories,
    selectedCategory,
    setSelectedCategory,
    
    // Loading functions
    loadProject,
    searchProjects
  };
}