import { useState } from "react";
import { Project } from "@shared/types";
import { Link } from "wouter";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Star, Download, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendedProjectsProps {
  title?: string;
  projects: Project[];
  className?: string;
}

export default function RecommendedProjects({ title = "Recommended for you", projects, className }: RecommendedProjectsProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="gap-1">
            See all <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex space-x-4 pb-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <Link href={`/project/${project.id}`}>
      <div 
        className="flex flex-col w-[140px] rounded-lg overflow-hidden group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
          <img 
            src={project.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b"} 
            alt={project.title} 
            className={cn(
              "w-full h-full object-cover transition-transform duration-300",
              isHovering ? "scale-110" : "scale-100"
            )}
          />
          
          {isHovering && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 hover:text-white"
              >
                <Download className="h-4 w-4 mr-1" /> Install
              </Button>
            </div>
          )}
        </div>
        
        <div className="p-2">
          <h3 className="font-medium text-sm line-clamp-1">{project.title}</h3>
          
          <div className="flex items-center mt-1">
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
              {project.views < 1000 ? project.views : `${(project.views / 1000).toFixed(1)}K`}
            </span>
          </div>
          
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {project.category} • {project.username}
          </div>
        </div>
      </div>
    </Link>
  );
}