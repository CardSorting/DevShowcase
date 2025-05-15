import { Link } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Project } from "@shared/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Heart } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  viewMode: "grid" | "list";
}

export default function ProjectCard({ project, viewMode }: ProjectCardProps) {
  const [isLiked, setIsLiked] = useState(project.isLiked);
  
  // Like project mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/projects/${project.id}/like`, {});
    },
    onSuccess: () => {
      setIsLiked(prev => !prev);
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });
  
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    likeMutation.mutate();
  };
  
  if (viewMode === "grid") {
    return (
      <Card className="overflow-hidden card-hover-effect transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <Link href={`/project/${project.id}`}>
          <div className="relative">
            <img 
              src={project.thumbnailUrl || "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500"} 
              alt={project.title} 
              className="w-full h-48 object-cover"
            />
            <button 
              className={`absolute top-3 right-3 bg-white/90 rounded-full p-1.5 shadow-sm ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
              onClick={handleLike}
            >
              <Heart className={isLiked ? "fill-red-500" : ""} size={16} />
            </button>
            <div className="absolute bottom-3 left-3 bg-primary/90 text-white px-2 py-1 rounded-md text-xs font-medium">
              {project.category}
            </div>
          </div>
          <CardContent className="p-5">
            <div className="flex items-center mb-1">
              <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
              {project.featured && (
                <Badge variant="secondary" className="ml-2 text-xs">Featured</Badge>
              )}
              {project.trending && (
                <Badge variant="default" className="ml-2 bg-accent/10 text-accent text-xs">Trending</Badge>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Avatar className="w-6 h-6 mr-2">
                  <AvatarFallback>{project.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{project.username}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="mr-1" size={14} />
                <span>{project.views >= 1000 ? `${(project.views / 1000).toFixed(1)}k` : project.views}</span>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }
  
  // List view
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
      <Link href={`/project/${project.id}`}>
        <div className="flex flex-col sm:flex-row">
          <div className="relative sm:w-64 h-48">
            <img 
              src={project.thumbnailUrl || "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500"} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
            <button 
              className={`absolute top-3 right-3 bg-white/90 rounded-full p-1.5 shadow-sm ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
              onClick={handleLike}
            >
              <Heart className={isLiked ? "fill-red-500" : ""} size={16} />
            </button>
            <div className="absolute bottom-3 left-3 bg-primary/90 text-white px-2 py-1 rounded-md text-xs font-medium">
              {project.category}
            </div>
          </div>
          <CardContent className="flex-1 p-5">
            <div className="flex items-center mb-1">
              <h3 className="font-semibold text-lg">{project.title}</h3>
              {project.featured && (
                <Badge variant="secondary" className="ml-2 text-xs">Featured</Badge>
              )}
              {project.trending && (
                <Badge variant="default" className="ml-2 bg-accent/10 text-accent text-xs">Trending</Badge>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3">{project.description}</p>
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex items-center mr-4">
                <Avatar className="w-6 h-6 mr-2">
                  <AvatarFallback>{project.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{project.username}</span>
              </div>
              <div className="flex space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Eye className="mr-1" size={14} />
                  {project.views >= 1000 ? `${(project.views / 1000).toFixed(1)}k` : project.views}
                </span>
                <span>Uploaded {formatDate(project.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}
