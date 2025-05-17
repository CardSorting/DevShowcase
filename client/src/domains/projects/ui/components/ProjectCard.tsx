import { Link } from "wouter";
import { Project } from "../../entities/Project";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Star, Download } from "lucide-react";
import { useProjectCommands } from "../hooks/useProjectCommands";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  viewType?: "card" | "grid" | "list";
}

/**
 * ProjectCard Component
 * Presentation component that uses our domain entities
 */
export function ProjectCard({ project, viewType = "card" }: ProjectCardProps) {
  const { toggleLike, isToggleLikeLoading } = useProjectCommands();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(project.id);
  };

  if (viewType === "grid") {
    return (
      <Link href={`/project/${project.id}`}>
        <div className="group relative overflow-hidden rounded-lg">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
            <img 
              src={project.getDisplayImage()} 
              alt={project.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <h3 className="font-medium text-white text-sm">{project.title}</h3>
            <p className="text-gray-300 text-xs">{project.username}</p>
          </div>
        </div>
      </Link>
    );
  }

  if (viewType === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
        <Link href={`/project/${project.id}`}>
          <div className="flex">
            <div className="w-32 sm:w-48 h-24 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <img 
                src={project.getDisplayImage()} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <CardContent className="flex-1 p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{project.title}</h3>
                <span className="text-xs text-muted-foreground">{project.getFormattedDate()}</span>
              </div>
              
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{project.description}</p>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {project.category}
                  </Badge>
                  <span className="text-muted-foreground">{project.username}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>{project.views}</span>
                  </div>
                  
                  <button 
                    onClick={handleLike}
                    className="flex items-center gap-1 text-muted-foreground"
                    disabled={isToggleLikeLoading}
                  >
                    <Heart className={`h-3 w-3 ${project.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    <span>{project.likes}</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </div>
        </Link>
      </Card>
    );
  }
  
  // Default card view
  return (
    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg group relative">
      <Link href={`/project/${project.id}`}>
        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          <img 
            src={project.getDisplayImage()} 
            alt={project.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-2 left-2 z-10">
            <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm text-xs">
              {project.category}
            </Badge>
          </div>
          
          <div className="absolute top-2 right-2 z-10 flex space-x-1">
            <button
              onClick={handleLike}
              className={`bg-white/90 rounded-full p-1.5 shadow-sm ${project.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
              disabled={isToggleLikeLoading}
            >
              <Heart className={`h-4 w-4 ${project.isLiked ? "fill-red-500" : ""}`} />
            </button>
            
            <Button 
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8 bg-white/90 backdrop-blur-sm"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
          </div>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{project.description}</p>
          
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">
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
            <span className="text-xs text-muted-foreground">
              ({project.views < 1000 ? project.views : `${(project.views / 1000).toFixed(1)}K`})
            </span>
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{project.username}</span>
            <span>{project.getFormattedDate()}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}