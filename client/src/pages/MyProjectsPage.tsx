import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ProjectCard from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, List, Upload, Rocket } from "lucide-react";
import { ProjectList } from "@shared/types";

export default function MyProjectsPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Fetch the authenticated user's projects
  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery<ProjectList>({
    queryKey: ['/api/my/projects'],
    retry: 1,
  });
  
  // Handle error state
  useEffect(() => {
    if (isError && error instanceof Error) {
      if ((error as any).status === 401) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your projects.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error loading projects",
          description: error.message || "Could not load your projects. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [isError, error, toast]);
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-gray-500 mt-1">Manage and view all your uploaded projects</p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-1 flex">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="flex items-center"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="flex items-center"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>
          
          <Button asChild>
            <Link href="#upload" className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Upload Project
            </Link>
          </Button>
        </div>
      </div>
      
      <Separator className="mb-8" />
      
      {isLoading ? (
        // Loading skeleton
        <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid-cols-1 gap-4"}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        // Error state
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium">Failed to load projects</h3>
          <p className="text-gray-500 mt-1 mb-4">
            {(error as any).status === 401 
              ? "Please log in to view your projects" 
              : "There was a problem loading your projects"}
          </p>
          {(error as any).status === 401 && (
            <Button asChild>
              <Link href="/auth/github">Login with GitHub</Link>
            </Button>
          )}
        </div>
      ) : data?.projects.length === 0 ? (
        // Empty state
        <div className="text-center py-16 border border-dashed rounded-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Rocket className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium">No projects yet</h3>
          <p className="text-gray-500 mt-1 mb-6 max-w-md mx-auto">
            You haven't uploaded any projects yet. Upload your first project to showcase it to the community!
          </p>
          <Button asChild>
            <Link href="#upload" className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Upload Your First Project
            </Link>
          </Button>
        </div>
      ) : (
        // Display projects
        <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}`}>
          {data?.projects.map((project) => (
            <ProjectCard key={project.id} project={project} viewMode={viewMode} />
          ))}
        </div>
      )}
      
      {data?.projects && data.projects.length > 0 && (
        <div className="mt-8 flex justify-center">
          {data.currentPage > 1 && (
            <Button 
              variant="outline" 
              className="mr-2"
              disabled
            >
              Previous
            </Button>
          )}
          
          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
            Page {data?.currentPage || 1} of {data?.totalPages || 1}
          </span>
          
          {data?.currentPage !== undefined && data?.totalPages !== undefined && data.currentPage < data.totalPages && (
            <Button 
              variant="outline" 
              className="ml-2"
              disabled
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}