import { Project } from "../../entities/Project";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopChartsProps {
  projects: Project[];
  className?: string;
  title?: string;
}

/**
 * TopCharts Component
 * Displays a list of top-ranked projects
 */
export function TopCharts({ 
  projects,
  className,
  title = "Top Charts"
}: TopChartsProps) {
  if (projects.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("rounded-xl bg-muted/30 p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <h3 className="font-medium">{title}</h3>
        </div>
        
        <Link href="/projects?sort=popular">
          <Button variant="ghost" size="sm" className="gap-1">
            See All <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
      
      <div className="space-y-3">
        {projects.slice(0, 5).map((project, index) => (
          <TopChartItem 
            key={project.id}
            project={project}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}

function TopChartItem({ project, rank }: { project: Project; rank: number }) {
  return (
    <Link href={`/project/${project.id}`}>
      <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="font-bold text-lg text-muted-foreground w-6 text-center">
          {rank}
        </div>
        
        <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
          <img
            src={project.getDisplayImage()}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {project.title}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {project.category} • {project.getFormattedViewCount()} views
          </p>
        </div>
      </div>
    </Link>
  );
}