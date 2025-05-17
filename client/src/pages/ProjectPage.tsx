import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Project } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import { Eye, ArrowLeft, Heart } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProjectPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Fetch project details
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
  });
  
  // Record a view for this project
  useEffect(() => {
    const recordView = async () => {
      if (id) {
        try {
          await apiRequest("POST", `/api/projects/${id}/view`, {});
          // Invalidate the project query to refresh view count
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
        } catch (error) {
          console.error("Failed to record view:", error);
        }
      }
    };
    
    recordView();
  }, [id]);
  
  // Like project mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/projects/${id}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      toast({
        title: "Project liked!",
        description: "You've successfully liked this project.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to like the project. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
              <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => setLocation("/")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Gallery
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{`${project.title} - DevShowcase`}</title>
        <meta name="description" content={project.description} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Button 
          variant="outline" 
          className="mb-6" 
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Gallery
        </Button>
        
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <span className="mr-4">Uploaded {formatDate(project.createdAt)}</span>
                <span className="flex items-center mr-4">
                  <Eye className="h-4 w-4 mr-1" /> {project.views} views
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {project.category}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className={project.isLiked ? "text-red-500" : "text-gray-500"}
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
            >
              <Heart className={`h-4 w-4 mr-2 ${project.isLiked ? "fill-red-500" : ""}`} />
              Like {project.likes > 0 && `(${project.likes})`}
            </Button>
          </div>
        </div>
        
        {/* Project Preview */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="h-[600px] w-full">
            <iframe 
              src={project.previewUrl} 
              className="w-full h-full border-0"
              title={`Preview of ${project.title}`}
              sandbox="allow-same-origin allow-scripts allow-forms"
              onError={() => {
                // If the iframe fails to load using the direct URL,
                // try the alternative URL format
                const projectId = project.projectUrl.split('/').pop();
                const altUrl = `/project/view/${projectId}`;
                if (projectId && altUrl !== project.previewUrl) {
                  // This will trigger a reload with the new URL
                  const frame = document.querySelector('iframe');
                  if (frame) frame.src = altUrl;
                }
              }}
            ></iframe>
          </div>
        </div>
        
        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Project Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Project Details</h2>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-500">Uploader</span>
                    <span className="font-medium">{project.username}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Uploaded On</span>
                    <span className="font-medium">{formatDate(project.createdAt)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium">{project.category}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Views</span>
                    <span className="font-medium">{project.views}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Likes</span>
                    <span className="font-medium">{project.likes}</span>
                  </li>
                </ul>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <a
                    href={`/project/view/${project.projectUrl.split('/').pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full">View Live Project</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
