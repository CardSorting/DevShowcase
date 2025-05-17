import { Project } from "../../entities/Project";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";

interface ProjectsGridProps {
  projects: Project[];
  viewType: 'card' | 'grid' | 'list';
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * ProjectsGrid Component
 * Displays projects in a responsive grid layout with different view types
 */
export function ProjectsGrid({ 
  projects, 
  viewType, 
  columns = 3,
  className
}: ProjectsGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No projects found</p>
      </div>
    );
  }
  
  const getGridColumns = () => {
    switch (columns) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 sm:grid-cols-2";
      case 3: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };
  
  return (
    <div className={cn(
      viewType === 'list' ? 'space-y-4' : `grid ${getGridColumns()} gap-4`,
      className
    )}>
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          viewType={viewType}
        />
      ))}
    </div>
  );
}