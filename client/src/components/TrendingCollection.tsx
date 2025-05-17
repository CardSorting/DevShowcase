import { Project } from "@shared/types";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface TrendingCollectionProps {
  projects: Project[];
}

export default function TrendingCollection({ projects }: TrendingCollectionProps) {
  // If no trending projects are available
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl">
        <p className="text-lg text-muted-foreground">No trending projects available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link key={project.id} href={`/project/${project.id}`}>
          <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg group">
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20 dark:from-orange-800/30 dark:to-red-800/30">
              <img 
                src={project.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b"} 
                alt={project.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-red-500 text-white text-xs flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
              </div>
              
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{project.description}</p>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {project.category}
                  </Badge>
                </div>
                
                <div className="text-muted-foreground">
                  <span>
                    {project.views} views
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}