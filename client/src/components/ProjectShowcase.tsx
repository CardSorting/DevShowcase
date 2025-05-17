import { Project } from "@shared/types";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Eye, Heart } from "lucide-react";

interface ProjectShowcaseProps {
  projects: Project[];
  viewType: "card" | "list" | "grid";
}

export default function ProjectShowcase({ projects, viewType }: ProjectShowcaseProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl">
        <p className="text-lg text-muted-foreground">No projects to display</p>
      </div>
    );
  }

  if (viewType === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link key={project.id} href={`/project/${project.id}`}>
            <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg group relative">
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                <img 
                  src={project.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b"} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2 z-10">
                  <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm text-xs">
                    {project.category}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1 mr-2">{project.title}</h3>
                  {project.featured && (
                    <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 dark:text-blue-400">Featured</Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{project.description}</p>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="font-medium">{project.username}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{project.views}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className={`h-3 w-3 ${project.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      <span>{project.likes}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  if (viewType === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {projects.map((project) => (
          <Link key={project.id} href={`/project/${project.id}`}>
            <div className="group relative overflow-hidden rounded-lg">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                <img 
                  src={project.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b"} 
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
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Link key={project.id} href={`/project/${project.id}`}>
          <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="flex">
              <div className="w-32 sm:w-48 h-24 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                <img 
                  src={project.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b"} 
                  alt={project.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardContent className="flex-1 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{project.title}</h3>
                  <span className="text-xs text-muted-foreground">{formatDate(project.createdAt)}</span>
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
                    
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className={`h-3 w-3 ${project.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      <span>{project.likes}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}