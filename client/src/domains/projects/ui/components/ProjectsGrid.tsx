import { Project } from "../../entities/Project";
import { ProjectCard } from "./ProjectCard";
import { cn } from "@/lib/utils";

interface ProjectsGridProps {
  projects: Project[];
  viewType?: "card" | "grid" | "list";
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * ProjectsGrid Component
 * Reusable grid layout for displaying multiple projects
 */
export function ProjectsGrid({ 
  projects,
  viewType = "card",
  columns = 3,
  className 
}: ProjectsGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl">
        <p className="text-lg text-muted-foreground">No projects to display</p>
      </div>
    );
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <div className={cn(
      viewType === "list" ? "space-y-4" : `grid ${gridCols[columns]} gap-6`,
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