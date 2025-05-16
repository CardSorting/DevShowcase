import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import {
  BarChart,
  BarChart2,
  Eye,
  Heart,
  LineChart,
  PieChart,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Activity
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar
} from "recharts";

interface UserProjectEntity {
  project: {
    id: number;
    userId?: number;
    title: string;
    description: string;
    category: string;
    projectUrl: string;
    previewUrl: string;
    thumbnailUrl?: string;
    views: number;
    likes: number;
    featured: boolean;
    trending: boolean;
    createdAt: string;
    updatedAt: string;
  };
  analytics: {
    dailyViews: { date: string; count: number }[];
    weeklyViews: { date: string; count: number }[];
    monthlyViews: { date: string; count: number }[];
    totalViews: number;
  };
  engagement: {
    likes: number;
    isLiked: boolean;
    conversionRate: number;
    growthRate: number;
  };
}

export default function UserProjectsPage() {
  const { user, isAuthenticated, isDeveloper } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  // Extract userId from URL - format: /user/:userId/projects
  const urlParts = location.split('/');
  const userIdIndex = urlParts.findIndex(part => part === 'user') + 1;
  const userId = userIdIndex > 0 ? parseInt(urlParts[userIdIndex], 10) : 0;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${location}`);
      toast({
        title: "Authentication Required",
        description: "Please log in to view your projects.",
        variant: "destructive",
      });
    } else if (user?.id !== userId && !user?.role.includes('admin')) {
      // If trying to access another user's projects without being an admin
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this user's projects.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user, userId, navigate, toast, location]);

  // Fetch user's projects with analytics
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: [`/api/user/${userId}/projects`],
    enabled: isAuthenticated && (user?.id === userId || user?.role === 'admin'),
    retry: false,
    onError: (error: any) => {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load your projects. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Fetch detailed analytics for selected project
  const { data: selectedProjectData, isLoading: isLoadingProjectDetails } = useQuery({
    queryKey: [`/api/user/${userId}/projects/${selectedProject}`],
    enabled: !!selectedProject && isAuthenticated,
    retry: false,
    onError: (error: any) => {
      console.error("Error fetching project details:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load project details. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (!isAuthenticated) {
    return null;
  }

  const userProjects: UserProjectEntity[] = projectsData?.projects || [];
  const totalProjects = userProjects.length;
  const totalViews = userProjects.reduce((sum, project) => sum + project.analytics.totalViews, 0);
  const totalLikes = userProjects.reduce((sum, project) => sum + project.engagement.likes, 0);
  
  // Select first project if none selected
  useEffect(() => {
    if (userProjects.length > 0 && !selectedProject) {
      setSelectedProject(userProjects[0].project.id);
    }
  }, [userProjects, selectedProject]);

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>Your Projects | Developer Showcase</title>
        <meta name="description" content="View analytics and engagement for your uploaded projects." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">Your Projects</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Projects</CardTitle>
            <CardDescription>Your uploaded projects</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {isLoadingProjects ? "..." : formatNumber(totalProjects)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Views</CardTitle>
            <CardDescription>Views across all projects</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {isLoadingProjects ? "..." : formatNumber(totalViews)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Likes</CardTitle>
            <CardDescription>Likes across all projects</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {isLoadingProjects ? "..." : formatNumber(totalLikes)}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>
                Select a project to view detailed analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto max-h-[500px]">
              {isLoadingProjects ? (
                <div className="flex justify-center py-6">Loading projects...</div>
              ) : (
                <div className="space-y-2">
                  {userProjects.length > 0 ? (
                    userProjects.map((projectEntity) => (
                      <div 
                        key={projectEntity.project.id} 
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedProject === projectEntity.project.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedProject(projectEntity.project.id)}
                      >
                        <div className="font-medium">{projectEntity.project.title}</div>
                        <div className="text-sm flex justify-between mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> 
                            {formatNumber(projectEntity.analytics.totalViews)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> 
                            {formatNumber(projectEntity.engagement.likes)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-secondary">
                            {projectEntity.project.category}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      You haven't created any projects yet
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={() => navigate("/upload")}>
                Upload New Project
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Project Analytics */}
        <div className="lg:col-span-2">
          {selectedProject && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      {isLoadingProjectDetails
                        ? "Loading..."
                        : selectedProjectData?.project.title}
                    </CardTitle>
                    <CardDescription>
                      Detailed analytics & engagement metrics
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => 
                      navigate(`/projects/${selectedProject}`)
                    }>
                      View Project
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="views">Views</TabsTrigger>
                    <TabsTrigger value="engagement">Engagement</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardHeader className="p-3">
                          <CardDescription>Total Views</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="text-2xl font-bold flex items-center">
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                            {isLoadingProjectDetails
                              ? "..."
                              : formatNumber(selectedProjectData?.analytics.totalViews || 0)}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="p-3">
                          <CardDescription>Total Likes</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="text-2xl font-bold flex items-center">
                            <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
                            {isLoadingProjectDetails
                              ? "..."
                              : formatNumber(selectedProjectData?.engagement.likes || 0)}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="p-3">
                          <CardDescription>Growth Rate</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="text-2xl font-bold flex items-center">
                            <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                            {isLoadingProjectDetails
                              ? "..."
                              : `${selectedProjectData?.engagement.growthRate.toFixed(1)}%`}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="p-3">
                          <CardDescription>Conversion Rate</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="text-2xl font-bold flex items-center">
                            <ArrowUpRight className="mr-2 h-4 w-4 text-muted-foreground" />
                            {isLoadingProjectDetails
                              ? "..."
                              : `${selectedProjectData?.engagement.conversionRate.toFixed(1)}%`}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Weekly Views Trend</h3>
                      <div className="h-[300px] w-full">
                        {!isLoadingProjectDetails && selectedProjectData && (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart
                              data={selectedProjectData.analytics.weeklyViews}
                              margin={{ top: 5, right: 20, left: 0, bottom: 30 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date"
                                angle={-45}
                                textAnchor="end"
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="count"
                                name="Views"
                                stroke="#8884d8"
                                activeDot={{ r: 8 }}
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="views">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Calendar className="h-5 w-5 mr-2" />
                            Daily Views
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[240px]">
                            {!isLoadingProjectDetails && selectedProjectData && (
                              <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart
                                  data={selectedProjectData.analytics.dailyViews.slice(-7)}
                                  margin={{ top: 5, right: 20, left: 0, bottom: 30 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis 
                                    dataKey="date"
                                    angle={-45}
                                    textAnchor="end"
                                    tick={{ fontSize: 12 }}
                                  />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="count" name="Views" fill="#8884d8" />
                                </RechartsBarChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Activity className="h-5 w-5 mr-2" />
                            Monthly Views
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[240px]">
                            {!isLoadingProjectDetails && selectedProjectData && (
                              <ResponsiveContainer width="100%" height="100%">
                                <RechartsLineChart
                                  data={selectedProjectData.analytics.monthlyViews.filter((_, i) => i % 3 === 0)}
                                  margin={{ top: 5, right: 20, left: 0, bottom: 30 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis 
                                    dataKey="date"
                                    angle={-45}
                                    textAnchor="end"
                                    tick={{ fontSize: 12 }}
                                  />
                                  <YAxis />
                                  <Tooltip />
                                  <Line
                                    type="monotone"
                                    dataKey="count"
                                    name="Views"
                                    stroke="#82ca9d"
                                  />
                                </RechartsLineChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {!isLoadingProjectDetails && selectedProjectData && (
                      <Table>
                        <TableCaption>Views by date for the last 7 days</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Views</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProjectData.analytics.dailyViews
                            .slice(-7)
                            .reverse()
                            .map((day) => (
                              <TableRow key={day.date}>
                                <TableCell>{formatDate(day.date)}</TableCell>
                                <TableCell className="text-right">{day.count}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  <TabsContent value="engagement">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Engagement Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Likes</span>
                              <span className="font-medium">
                                {isLoadingProjectDetails
                                  ? "..."
                                  : formatNumber(selectedProjectData?.engagement.likes || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Conversion Rate</span>
                              <span className="font-medium">
                                {isLoadingProjectDetails
                                  ? "..."
                                  : `${selectedProjectData?.engagement.conversionRate.toFixed(1)}%`}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Growth Rate (Week/Week)</span>
                              <span className="font-medium">
                                {isLoadingProjectDetails
                                  ? "..."
                                  : `${selectedProjectData?.engagement.growthRate.toFixed(1)}%`}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Featured</span>
                              <span className="font-medium">
                                {isLoadingProjectDetails
                                  ? "..."
                                  : selectedProjectData?.project.featured ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Trending</span>
                              <span className="font-medium">
                                {isLoadingProjectDetails
                                  ? "..."
                                  : selectedProjectData?.project.trending ? "Yes" : "No"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Project Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Category</span>
                              <span className="font-medium px-2 py-1 rounded text-xs bg-secondary">
                                {isLoadingProjectDetails
                                  ? "..."
                                  : selectedProjectData?.project.category}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Created</span>
                              <span className="font-medium">
                                {isLoadingProjectDetails
                                  ? "..."
                                  : formatDate(selectedProjectData?.project.createdAt || '')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Last Updated</span>
                              <span className="font-medium">
                                {isLoadingProjectDetails
                                  ? "..."
                                  : formatDate(selectedProjectData?.project.updatedAt || '')}
                              </span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <p className="text-muted-foreground mb-1">Description</p>
                              <p className="text-sm">
                                {isLoadingProjectDetails
                                  ? "..."
                                  : selectedProjectData?.project.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}