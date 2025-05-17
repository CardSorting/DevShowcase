import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ProjectCard from "@/components/ProjectCard";
import UploadSection from "@/components/UploadSection";
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
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, { credentials: "include" });
        
        if (res.status === 401) {
          throw { status: 401, message: "Authentication required" };
        }
        
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        
        return await res.json();
      } catch (err) {
        throw err;
      }
    }
  });
  
  // Handle error state
  useEffect(() => {
    if (isError) {
      if ((error as any)?.status === 401) {
        // No need to show a toast for authentication error
        // The UI will already show the login button
        console.log("Authentication required to view projects");
      } else {
        toast({
          title: "Error loading projects",
          description: error instanceof Error ? error.message : "Could not load your projects. Please try again.",
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
          <h3 className="text-lg font-medium">Authentication Required</h3>
          <p className="text-gray-500 mt-1 mb-4">
            {(error as any)?.status === 401 
              ? "Please log in with GitHub to view and manage your projects" 
              : "There was a problem loading your projects"}
          </p>
          {(error as any)?.status === 401 && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <a href="/auth/github" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                Login with GitHub
              </a>
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
      
      <div className="mt-16">
        {isError && (error as any)?.status === 401 ? (
          <section id="upload" className="mb-16">
            <div className="border-2 border-dashed rounded-lg p-10 text-center">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
              <p className="text-gray-500 mb-6">
                Please log in with GitHub to upload and manage your projects.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <a href="/auth/github" className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
                  </svg>
                  Login with GitHub
                </a>
              </Button>
            </div>
          </section>
        ) : (
          <UploadSection />
        )}
      </div>
    </div>
  );
}