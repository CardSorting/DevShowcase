import { Link } from "wouter";
import { Project } from "../../entities/Project";
import { cn } from "@/lib/utils";
import { useProjectCommands } from "../hooks/useProjectCommands";
import { Heart, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProjectCardProps {
  project: Project;
  viewType: 'card' | 'grid' | 'list';
  className?: string;
}

/**
 * ProjectCard Component
 * Displays a project in different view types (card, grid, or list)
 */
export function ProjectCard({ 
  project, 
  viewType,
  className 
}: ProjectCardProps) {
  const { toggleLike, isToggleLikeLoading } = useProjectCommands();
  
  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isToggleLikeLoading) {
      toggleLike(project.id);
    }
  };
  
  const handleVisitProject = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Open project in a new tab
    window.open(project.projectUrl, '_blank');
  };
  
  // Card view (compact, grid-friendly display)
  if (viewType === 'card') {
    return (
      <Link href={`/project/${project.id}`}>
        <Card className={cn("overflow-hidden group h-full transition-all hover:shadow-md", className)}>
          <div className="aspect-video relative overflow-hidden bg-muted">
            <img 
              src={project.getDisplayImage()} 
              alt={project.title}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
            
            {project.featured && (
              <Badge className="absolute top-2 left-2 bg-primary/70 hover:bg-primary/70">
                Featured
              </Badge>
            )}
            
            {project.trending && (
              <Badge className="absolute top-2 right-2 bg-orange-500/70 hover:bg-orange-500/70">
                Trending
              </Badge>
            )}
          </div>
          
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                {project.title}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {project.description}
            </p>
            
            <div className="text-xs text-muted-foreground">
              {project.category} • {project.username}
            </div>
          </CardContent>
          
          <CardFooter className="px-4 py-3 border-t text-xs text-muted-foreground flex justify-between items-center bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{project.getFormattedViewCount()}</span>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full"
                onClick={handleLike}
              >
                <Heart 
                  className={cn(
                    "h-3.5 w-3.5 transition-colors", 
                    project.isLiked && "fill-red-500 text-red-500"
                  )} 
                />
                <span className="sr-only">Like</span>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={handleVisitProject}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="sr-only">Open project</span>
            </Button>
          </CardFooter>
        </Card>
      </Link>
    );
  }
  
  // List view (horizontal, detail-rich layout)
  if (viewType === 'list') {
    return (
      <Link href={`/project/${project.id}`}>
        <Card className={cn("overflow-hidden group transition-all hover:shadow-md", className)}>
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-1/3 md:w-1/4 aspect-video sm:aspect-square relative overflow-hidden bg-muted">
              <img 
                src={project.getDisplayImage()} 
                alt={project.title}
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
              />
              
              {project.featured && (
                <Badge className="absolute top-2 left-2 bg-primary/70 hover:bg-primary/70">
                  Featured
                </Badge>
              )}
              
              {project.trending && (
                <Badge className="absolute top-2 right-2 bg-orange-500/70 hover:bg-orange-500/70">
                  Trending
                </Badge>
              )}
            </div>
            
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {project.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="inline-block bg-muted/50 px-2 py-0.5 rounded text-xs">
                    {project.category}
                  </span>
                  <span className="mx-2">•</span>
                  <span>By {project.username}</span>
                  <span className="mx-2">•</span>
                  <span>{project.getFormattedDate()}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Eye className="h-4 w-4" />
                    <span>{project.getFormattedViewCount()}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm">
                    <Heart 
                      className={cn(
                        "h-4 w-4", 
                        project.isLiked && "fill-red-500 text-red-500"
                      )} 
                    />
                    <span>{project.getFormattedLikeCount()}</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={handleVisitProject}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Visit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }
  
  // Grid view (compact thumbnail-focused display)
  return (
    <Link href={`/project/${project.id}`}>
      <div className={cn("group relative overflow-hidden rounded-lg", className)}>
        <div className="aspect-square relative overflow-hidden bg-muted">
          <img 
            src={project.getDisplayImage()} 
            alt={project.title}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <h3 className="font-medium text-white">
              {project.title}
            </h3>
            <p className="text-xs text-white/80">
              {project.category}
            </p>
          </div>
          
          {project.featured && (
            <Badge className="absolute top-2 left-2 bg-primary/70 hover:bg-primary/70">
              Featured
            </Badge>
          )}
          
          {project.trending && (
            <Badge className="absolute top-2 right-2 bg-orange-500/70 hover:bg-orange-500/70">
              Trending
            </Badge>
          )}
          
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={handleLike}
            >
              <Heart 
                className={cn(
                  "h-4 w-4", 
                  project.isLiked && "fill-red-500 text-red-500"
                )} 
              />
              <span className="sr-only">Like</span>
            </Button>
            
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={handleVisitProject}
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Open project</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}