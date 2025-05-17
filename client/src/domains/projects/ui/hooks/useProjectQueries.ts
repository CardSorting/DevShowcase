import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProjects } from '../../providers/ProjectsProvider';
import { Project, ProjectCategory } from '../../entities/Project';
import { 
  ProjectListResult, 
  ProjectRepositoryOptions,
  ProjectSortOption,
  PopularityFilter,
  PaginationOptions
} from '../../interfaces/ProjectRepository';

/**
 * Enhanced project query options
 * Provides additional UI-specific options for queries
 */
interface ProjectQueryOptions {
  sort?: ProjectSortOption;
  category?: ProjectCategory;
  popularity?: PopularityFilter;
  search?: string;
  page?: number;
  pageSize?: number;
  userId?: number;
}

/**
 * Custom hook for project queries
 * Provides a clean interface between UI and domain logic following Clean Architecture
 */
export const useProjectQueries = (initialOptions: ProjectQueryOptions = {}) => {
  // State for query parameters
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | "">
    (initialOptions.category || "");
  const [sortBy, setSortBy] = useState<ProjectSortOption>(initialOptions.sort || "popular");
  const [popularityFilter, setPopularityFilter] = useState<PopularityFilter>(initialOptions.popularity || "any");
  const [searchQuery, setSearchQuery] = useState<string>(initialOptions.search || "");
  const [page, setPage] = useState<number>(initialOptions.page || 1);
  const [pageSize, setPageSize] = useState<number>(initialOptions.pageSize || 12);
  
  // Get the repository from our provider
  const { repository } = useProjects();
  
  // Convert UI options to repository options
  const buildRepositoryOptions = (
    overrides: Partial<ProjectQueryOptions> = {}
  ): ProjectRepositoryOptions => {
    const pagination: PaginationOptions = { 
      page: overrides.page ?? page,
      pageSize: overrides.pageSize ?? pageSize 
    };
    
    const options: ProjectRepositoryOptions = {
      sort: overrides.sort ?? sortBy,
      pagination,
      popularity: overrides.popularity ?? popularityFilter,
    };
    
    // Only add search if it's not empty
    if ((overrides.search !== undefined ? overrides.search : searchQuery).trim()) {
      options.search = overrides.search ?? searchQuery;
    }
    
    // Only add category if it's selected
    const category = overrides.category !== undefined 
      ? overrides.category 
      : selectedCategory;
      
    if (category) {
      options.categories = [category];
    }
    
    // Add userId if provided
    if (overrides.userId !== undefined ? overrides.userId : initialOptions.userId) {
      options.userId = overrides.userId ?? initialOptions.userId;
    }
    
    return options;
  };
  
  // Generate a unique query key based on options
  const getQueryKey = (
    baseKey: string, 
    options: ProjectRepositoryOptions
  ): Array<string | number | boolean | object> => {
    return [
      baseKey,
      options.sort || 'default',
      options.categories ? options.categories.join(',') : 'all',
      options.popularity || 'any',
      options.search || '',
      options.pagination?.page || 1,
      options.pagination?.pageSize || 12,
      options.userId || 'all',
    ];
  };

  // Query for all projects with current filters
  const allProjectsOptions = useMemo(() => buildRepositoryOptions(), 
    [sortBy, selectedCategory, popularityFilter, searchQuery, page, pageSize, initialOptions.userId]);
    
  const allProjectsQuery = useQuery<ProjectListResult>({
    queryKey: getQueryKey('/api/projects', allProjectsOptions),
    queryFn: async () => {
      return await repository.getProjects(allProjectsOptions);
    }
  });

  // Query for featured projects
  const featuredProjectsQuery = useQuery<Project[]>({
    queryKey: ['/api/projects', 'featured'],
    queryFn: async () => {
      return await repository.getFeaturedProjects(6);
    }
  });

  // Query for trending projects
  const trendingProjectsQuery = useQuery<Project[]>({
    queryKey: ['/api/projects', 'trending'],
    queryFn: async () => {
      return await repository.getTrendingProjects(6);
    }
  });

  // Query for top projects
  const topProjectsQuery = useQuery<Project[]>({
    queryKey: ['/api/projects', 'top'],
    queryFn: async () => {
      return await repository.getTopProjects(5);
    }
  });
  
  // Query for new projects
  const newProjectsQuery = useQuery<Project[]>({
    queryKey: ['/api/projects', 'new'],
    queryFn: async () => {
      return await repository.getNewProjects(7, 6);
    }
  });
  
  // Query for recommended projects
  const recommendedProjectsQuery = useQuery<Project[]>({
    queryKey: ['/api/projects', 'recommended', initialOptions.userId || 'anonymous'],
    queryFn: async () => {
      return await repository.getRecommendedProjects(initialOptions.userId, 6);
    }
  });

  // Get projects by a specific category
  const getProjectsByCategory = async (category: ProjectCategory, limit?: number): Promise<Project[]> => {
    const result = await repository.getProjectsByCategory(category, {
      sort: 'popular',
      pagination: { page: 1, pageSize: limit || 6 }
    });
    return result.projects;
  };
  
  // Search projects with a specific query
  const searchProjects = async (query: string, options: ProjectQueryOptions = {}): Promise<ProjectListResult> => {
    const repoOptions = buildRepositoryOptions({
      ...options,
      search: query
    });
    return await repository.searchProjects(query, repoOptions);
  };

  // Get categories from the data
  const categories = allProjectsQuery.data?.categoryCounts
    ? Object.keys(allProjectsQuery.data.categoryCounts) as ProjectCategory[]
    : [];

  // Check if any of the queries are loading
  const isLoading =
    allProjectsQuery.isLoading ||
    featuredProjectsQuery.isLoading ||
    trendingProjectsQuery.isLoading ||
    topProjectsQuery.isLoading ||
    newProjectsQuery.isLoading ||
    recommendedProjectsQuery.isLoading;

  // Check if there was an error in any of the queries
  const error =
    allProjectsQuery.error ||
    featuredProjectsQuery.error ||
    trendingProjectsQuery.error ||
    topProjectsQuery.error ||
    newProjectsQuery.error ||
    recommendedProjectsQuery.error;

  // Pagination controls
  const nextPage = () => {
    if (allProjectsQuery.data && page < allProjectsQuery.data.totalPages) {
      setPage(prev => prev + 1);
    }
  };
  
  const prevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };
  
  const goToPage = (pageNumber: number) => {
    const maxPage = allProjectsQuery.data?.totalPages || 1;
    const targetPage = Math.max(1, Math.min(pageNumber, maxPage));
    setPage(targetPage);
  };

  return {
    // Data
    projectsData: allProjectsQuery.data,
    featuredProjects: featuredProjectsQuery.data || [],
    trendingProjects: trendingProjectsQuery.data || [],
    topProjects: topProjectsQuery.data || [],
    newProjects: newProjectsQuery.data || [],
    recommendedProjects: recommendedProjectsQuery.data || [],
    
    // Filters and categories
    categories,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    popularityFilter,
    setPopularityFilter,
    searchQuery,
    setSearchQuery,
    
    // Pagination
    page,
    pageSize,
    setPageSize,
    nextPage,
    prevPage,
    goToPage,
    
    // Methods
    getProjectsByCategory,
    searchProjects,
    
    // Status
    isLoading,
    error,
    
    // Refetch methods
    refetch: allProjectsQuery.refetch,
    refetchFeatured: featuredProjectsQuery.refetch,
    refetchTrending: trendingProjectsQuery.refetch,
  };
};