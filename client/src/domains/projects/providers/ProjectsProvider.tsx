import { createContext, useContext, ReactNode } from 'react';
import { ProjectRepository } from '../interfaces/ProjectRepository';
import { ApiProjectRepository } from '../repositories/ApiProjectRepository';
import { GetFeaturedProjectsQuery } from '../queries/GetFeaturedProjectsQuery';
import { GetTrendingProjectsQuery } from '../queries/GetTrendingProjectsQuery';
import { GetProjectsByCategoryQuery } from '../queries/GetProjectsByCategoryQuery';
import { ToggleProjectLikeCommand } from '../commands/ToggleProjectLikeCommand';

// Create a repository instance
const repository = new ApiProjectRepository();

// Create query instances
const getFeaturedProjectsQuery = new GetFeaturedProjectsQuery(repository);
const getTrendingProjectsQuery = new GetTrendingProjectsQuery(repository);
const getProjectsByCategoryQuery = new GetProjectsByCategoryQuery(repository);

// Create command instances
const toggleProjectLikeCommand = new ToggleProjectLikeCommand(repository);

// Define context type
interface ProjectsContextType {
  repository: ProjectRepository;
  queries: {
    getFeaturedProjects: GetFeaturedProjectsQuery;
    getTrendingProjects: GetTrendingProjectsQuery;
    getProjectsByCategory: GetProjectsByCategoryQuery;
  };
  commands: {
    toggleProjectLike: ToggleProjectLikeCommand;
  };
}

// Create the context
const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Provider props
interface ProjectsProviderProps {
  children: ReactNode;
}

/**
 * ProjectsProvider Component
 * Provider for projects domain context
 * Follows the Provider pattern to make domain services available throughout the app
 */
export function ProjectsProvider({ children }: ProjectsProviderProps) {
  // Prepare context value
  const value: ProjectsContextType = {
    repository,
    queries: {
      getFeaturedProjects: getFeaturedProjectsQuery,
      getTrendingProjects: getTrendingProjectsQuery,
      getProjectsByCategory: getProjectsByCategoryQuery
    },
    commands: {
      toggleProjectLike: toggleProjectLikeCommand
    }
  };
  
  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

/**
 * Hook to access the projects context
 * Throws an error if used outside of ProjectsProvider
 */
export function useProjects(): ProjectsContextType {
  const context = useContext(ProjectsContext);
  
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  
  return context;
}