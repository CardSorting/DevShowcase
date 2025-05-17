import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ProjectCard from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectList } from "@shared/types";
import { Grid, List } from "lucide-react";

// Domain models
export type ProjectCategory = "landing-page" | "web-app" | "portfolio" | "game" | "ecommerce" | "other";
export type ProjectSort = "popular" | "recent" | "trending";
export type ProjectView = "grid" | "list";

// Query parameters interface following Command Query Separation pattern
export interface ProjectsQueryParams {
  sort?: ProjectSort;
  page?: number;
  categories?: ProjectCategory[];
  search?: string;
}

// Props interface following Interface Segregation Principle
interface ProjectsPageProps {
  title: string;
  description: string;
  defaultQueryParams: ProjectsQueryParams;
}

/**
 * Base component for project listings following SOLID principles
 * Acts as a flexible, reusable component that can be extended for different views
 */
export default function ProjectsPage({ 
  title, 
  description, 
  defaultQueryParams 
}: ProjectsPageProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ProjectView>("grid");
  const [queryParams, setQueryParams] = useState<ProjectsQueryParams>(defaultQueryParams);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Build query string based on parameters
  const getQueryString = () => {
    const params = new URLSearchParams();
    
    if (queryParams.sort) params.append("sort", queryParams.sort);
    if (queryParams.page) params.append("page", queryParams.page.toString());
    if (queryParams.search) params.append("search", queryParams.search);
    
    if (queryParams.categories && queryParams.categories.length > 0) {
      params.append("categories", queryParams.categories.join(","));
    }
    
    return params.toString() ? `?${params.toString()}` : "";
  };
  
  // Fetch projects using the query parameters
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useQuery<ProjectList>({
    queryKey: [`/api/projects${getQueryString()}`],
  });
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setQueryParams(prev => ({ ...prev, page }));
  };
  
  // Handle error display
  useEffect(() => {
    if (isError && error instanceof Error) {
      toast({
        title: "Error loading projects",
        description: error.message || "Could not load projects. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-1">{description}</p>
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
        </div>
      </div>
      
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
            There was a problem loading projects. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : data?.projects && data.projects.length === 0 ? (
        // Empty state
        <div className="text-center py-16 border border-dashed rounded-lg">
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-gray-500 mt-1 mb-6 max-w-md mx-auto">
            There are no projects matching your criteria. Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        // Display projects
        <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}`}>
          {data?.projects.map((project: any) => (
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
              onClick={() => handlePageChange(data.currentPage - 1)}
            >
              Previous
            </Button>
          )}
          
          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
            Page {data?.currentPage || 1} of {data?.totalPages || 1}
          </span>
          
          {data?.currentPage !== undefined && 
           data?.totalPages !== undefined && 
           data.currentPage < data.totalPages && (
            <Button 
              variant="outline" 
              className="ml-2"
              onClick={() => handlePageChange(data.currentPage + 1)}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}