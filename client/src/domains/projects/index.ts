/**
 * Projects Domain Module Entry Point
 * Exports all necessary components and hooks for use in the main application
 */

// Entities
export * from './entities/Project';

// Interfaces
export * from './interfaces/ProjectRepository';

// Providers
export { ProjectsProvider, useProjects } from './providers/ProjectsProvider';

// UI Components
export { FeaturedProjects } from './ui/components/FeaturedProjects';
export { CategoryNavigation } from './ui/components/CategoryNavigation';
export { ProjectsGrid } from './ui/components/ProjectsGrid';
export { ProjectCard } from './ui/components/ProjectCard';
export { TopCharts } from './ui/components/TopCharts';

// Pages
export { HomePage } from './ui/pages/HomePage';

// Hooks
export { useProjectQueries } from './ui/hooks/useProjectQueries';
export { useProjectCommands } from './ui/hooks/useProjectCommands';