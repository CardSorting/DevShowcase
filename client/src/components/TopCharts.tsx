import { Project } from "@shared/types";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Download, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopChartsProps {
  title?: string;
  projects: Project[];
  className?: string;
}

export default function TopCharts({ 
  title = "Top Charts", 
  projects, 
  className 
}: TopChartsProps) {
  if (projects.length === 0) {
    return null;
  }

  // Limit to top 5 projects
  const topProjects = [...projects]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <Link href="/projects?sort=popular">
          <Button variant="ghost" size="sm" className="gap-1">
            See all <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="space-y-3">
        {topProjects.map((project, index) => (
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
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors group">
        <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
          {rank}
        </div>
        
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted">
          <img 
            src={project.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b"} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{project.title}</h3>
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="truncate">{project.username}</span>
            <span className="mx-1">•</span>
            <Badge variant="outline" className="text-[10px] h-4 px-1">
              {project.category}
            </Badge>
          </div>
          <div className="flex items-center mt-0.5">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={cn(
                    "h-3 w-3", 
                    star <= Math.min(Math.round(project.likes / 5), 5) 
                      ? "text-yellow-500 fill-yellow-500" 
                      : "text-gray-300 dark:text-gray-600"
                  )} 
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">
              ({project.views < 1000 ? project.views : `${(project.views / 1000).toFixed(1)}K`})
            </span>
          </div>
        </div>
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Download className="h-4 w-4 mr-1" />
          Install
        </Button>
      </div>
    </Link>
  );
}