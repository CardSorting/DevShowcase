import { Project } from "@shared/types";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Heart, Star } from "lucide-react";

interface EditorsPickProps {
  projects: Project[];
}

export default function EditorsPick({ projects }: EditorsPickProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl">
        <p className="text-lg text-muted-foreground">No featured projects available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => (
        <Link key={project.id} href={`/project/${project.id}`}>
          <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg group">
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-1/3 aspect-square sm:aspect-auto sm:h-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 dark:from-yellow-800/30 dark:to-orange-800/30">
                <img 
                  src={project.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b"} 
                  alt={project.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardContent className="flex-1 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{project.description}</p>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-2 py-0 border-yellow-500 text-yellow-600 dark:text-yellow-400">
                      Editor's Choice
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      {project.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Heart className={`h-3 w-3 ${project.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    <span>{project.likes}</span>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-muted-foreground flex justify-between">
                  <span>By {project.username}</span>
                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}