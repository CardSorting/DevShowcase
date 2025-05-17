import React, { createContext, useContext, ReactNode } from 'react';
import { ApiProjectRepository } from '../repositories/ApiProjectRepository';
import { ProjectRepository } from '../interfaces/ProjectRepository';
import { GetFeaturedProjectsQuery } from '../queries/GetFeaturedProjectsQuery';
import { GetTrendingProjectsQuery } from '../queries/GetTrendingProjectsQuery';
import { GetProjectsByCategoryQuery } from '../queries/GetProjectsByCategoryQuery';
import { ToggleProjectLikeCommand } from '../commands/ToggleProjectLikeCommand';

/**
 * Projects Context Provider that implements the Dependency Injection pattern
 * Follows the Open/Closed Principle (OCP) from SOLID
 */

// Create the repositories
const projectRepository: ProjectRepository = new ApiProjectRepository();

// Create the queries and commands
const queries = {
  getFeaturedProjects: new GetFeaturedProjectsQuery(projectRepository),
  getTrendingProjects: new GetTrendingProjectsQuery(projectRepository),
  getProjectsByCategory: new GetProjectsByCategoryQuery(projectRepository),
};

const commands = {
  toggleProjectLike: new ToggleProjectLikeCommand(projectRepository),
};

// Create the context
type ProjectsContextType = {
  repository: ProjectRepository;
  queries: typeof queries;
  commands: typeof commands;
};

const ProjectsContext = createContext<ProjectsContextType | null>(null);

// Create the provider component
export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ProjectsContext.Provider
      value={{
        repository: projectRepository,
        queries,
        commands,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

// Create a hook for using the Projects context
export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};