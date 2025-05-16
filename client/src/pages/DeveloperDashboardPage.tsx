import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/utils";
import { Helmet } from "react-helmet";
import { 
  BarChart, 
  LineChart, 
  TrendingUp, 
  Eye, 
  Heart, 
  FileUp, 
  Download, 
  BarChart2, 
  PieChart,
  Upload
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@shared/types";

export default function DeveloperDashboardPage() {
  const { user, isAuthenticated, isDeveloper } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated or not a developer
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/developer/dashboard");
      toast({
        title: "Authentication Required",
        description: "Please log in to access the developer dashboard.",
        variant: "destructive",
      });
    } else if (!isDeveloper) {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the developer dashboard.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isDeveloper, navigate, toast]);

  // Fetch user's projects with analytics
  const { data: userProjects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/projects/user"],
    enabled: isAuthenticated && isDeveloper,
  });

  if (!isAuthenticated || !isDeveloper) {
    return null;
  }
  
  // Calculate totals from projects
  const totalProjects = userProjects?.length || 0;
  const totalViews = userProjects?.reduce((sum: number, project: any) => sum + project.views, 0) || 0;
  const totalLikes = userProjects?.reduce((sum: number, project: any) => sum + project.likes, 0) || 0;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Developer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>My Projects</CardTitle>
            <CardDescription>Projects you've created</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {isLoadingProjects ? "..." : userProjects?.length || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Views</CardTitle>
            <CardDescription>Views across all your projects</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {isLoadingProjects
              ? "..."
              : userProjects?.reduce((sum: number, project: any) => sum + project.views, 0) || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Likes</CardTitle>
            <CardDescription>Likes across all your projects</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {isLoadingProjects
              ? "..."
              : userProjects?.reduce((sum: number, project: any) => sum + project.likes, 0) || 0}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>
            Manage your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProjects ? (
            <div className="flex justify-center py-6">Loading projects...</div>
          ) : (
            <Table>
              <TableCaption>Your uploaded projects</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userProjects && userProjects.length > 0 ? (
                  userProjects.map((project: any) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100">
                          {project.category}
                        </span>
                      </TableCell>
                      <TableCell>{project.views}</TableCell>
                      <TableCell>{project.likes}</TableCell>
                      <TableCell>{formatDate(project.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${project.id}`)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      You haven't created any projects yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={() => navigate("/upload")}>
            Create New Project
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Developer Resources</CardTitle>
            <CardDescription>
              Helpful resources and documentation for developers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Complete API reference for integrating with our platform
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    View Docs
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Guidelines for creating high-quality projects
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Get help with technical issues and questions
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Support
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}