import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProjects } from '../../providers/ProjectsProvider';
import { Project } from '../../entities/Project';
import { ProjectListResult } from '../../interfaces/ProjectRepository';

/**
 * Custom hook for project queries
 * Provides a clean interface between UI and domain logic
 */
export const useProjectQueries = () => {
  const { repository } = useProjects();
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Query for all projects
  const allProjectsQuery = useQuery<ProjectListResult>({
    queryKey: ['/api/projects', 'popular', 1],
    queryFn: async () => {
      return await repository.getProjects({ sort: 'popular', page: 1 });
    }
  });

  // Query for category-filtered projects
  const categoryProjectsQuery = useQuery<ProjectListResult>({
    queryKey: ['/api/projects', 'category', selectedCategory],
    queryFn: async () => {
      return await repository.getProjectsByCategory(selectedCategory, { page: 1 });
    },
    enabled: !!selectedCategory,
  });

  // Get featured projects (top 5)
  const featuredProjectsQuery = useQuery<Project[]>({
    queryKey: ['/api/projects', 'featured'],
    queryFn: async () => {
      return await repository.getFeaturedProjects(5);
    }
  });

  // Get trending projects (top 5)
  const trendingProjectsQuery = useQuery<Project[]>({
    queryKey: ['/api/projects', 'trending'],
    queryFn: async () => {
      return await repository.getTrendingProjects(5);
    }
  });

  // Get top projects (top 5)
  const topProjectsQuery = useQuery<Project[]>({
    queryKey: ['/api/projects', 'top'],
    queryFn: async () => {
      return await repository.getTopProjects(5);
    }
  });

  // Use the appropriate query result based on whether a category is selected
  const projectsData = selectedCategory && categoryProjectsQuery.data
    ? categoryProjectsQuery.data
    : allProjectsQuery.data;

  // Get categories from the data
  const categories = projectsData?.categoryCounts
    ? Object.keys(projectsData.categoryCounts)
    : [];

  // Check if any of the queries are loading
  const isLoading =
    allProjectsQuery.isLoading ||
    (selectedCategory && categoryProjectsQuery.isLoading) ||
    featuredProjectsQuery.isLoading ||
    trendingProjectsQuery.isLoading ||
    topProjectsQuery.isLoading;

  // Check if there was an error in any of the queries
  const error =
    allProjectsQuery.error ||
    (selectedCategory && categoryProjectsQuery.error) ||
    featuredProjectsQuery.error ||
    trendingProjectsQuery.error ||
    topProjectsQuery.error;

  return {
    projectsData,
    featuredProjects: featuredProjectsQuery.data || [],
    trendingProjects: trendingProjectsQuery.data || [],
    topProjects: topProjectsQuery.data || [],
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    error,
  };
};