import { Link } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Project } from "@shared/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Heart, Trash2, MoreVertical } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectCardProps {
  project: Project;
  viewMode: "grid" | "list";
}

export default function ProjectCard({ project, viewMode }: ProjectCardProps) {
  const [isLiked, setIsLiked] = useState(project.isLiked);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  
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
  
  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/projects/${project.id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "Your project has been successfully deleted.",
      });
      // Invalidate both projects and my projects queries
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my/projects'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    likeMutation.mutate();
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = () => {
    deleteMutation.mutate();
    setShowDeleteDialog(false);
  };
  
  // Define the project card content based on view mode (grid or list)
  const renderCard = () => {
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
              <div className="absolute top-3 right-3 flex space-x-2">
                <button 
                  className={`bg-white/90 rounded-full p-1.5 shadow-sm ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                  onClick={handleLike}
                >
                  <Heart className={isLiked ? "fill-red-500" : ""} size={16} />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="bg-white/90 rounded-full p-1.5 shadow-sm text-gray-500 hover:text-gray-700">
                      <MoreVertical size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-red-500 cursor-pointer flex items-center"
                      onClick={handleDelete}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
    } else {
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
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button 
                    className={`bg-white/90 rounded-full p-1.5 shadow-sm ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                    onClick={handleLike}
                  >
                    <Heart className={isLiked ? "fill-red-500" : ""} size={16} />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="bg-white/90 rounded-full p-1.5 shadow-sm text-gray-500 hover:text-gray-700">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-red-500 cursor-pointer flex items-center"
                        onClick={handleDelete}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
  };

  return (
    <>
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your project
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {renderCard()}
    </>
  );
}
