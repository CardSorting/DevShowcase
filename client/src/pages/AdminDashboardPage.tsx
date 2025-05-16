import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/admin/dashboard");
      toast({
        title: "Authentication Required",
        description: "Please log in to access the admin dashboard.",
        variant: "destructive",
      });
    } else if (!isAdmin) {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin dashboard.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/auth/users"],
    enabled: isAuthenticated && isAdmin,
  });

  // Fetch popular projects
  const { data: popularProjects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/projects", { sort: "popular", limit: 5 }],
    enabled: isAuthenticated && isAdmin,
  });

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Users</CardTitle>
            <CardDescription>User accounts on the platform</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {isLoadingUsers ? "..." : users?.length || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Projects</CardTitle>
            <CardDescription>Projects uploaded to the platform</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {isLoadingProjects ? "..." : popularProjects?.totalCount || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Featured Projects</CardTitle>
            <CardDescription>Projects highlighted on the platform</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {isLoadingProjects
              ? "..."
              : popularProjects?.projects.filter((p: any) => p.featured).length || 0}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Popular Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center py-6">Loading users...</div>
              ) : (
                <Table>
                  <TableCaption>List of all users on the platform</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users && users.length > 0 ? (
                      users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-red-100 text-red-800"
                                  : user.role === "developer"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            {user.isActive ? (
                              <span className="text-green-600 font-medium">
                                Active
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium">
                                Inactive
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline">Export Users</Button>
              <Button>Add New User</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Popular Projects</CardTitle>
              <CardDescription>
                Most viewed and liked projects on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProjects ? (
                <div className="flex justify-center py-6">
                  Loading projects...
                </div>
              ) : (
                <Table>
                  <TableCaption>
                    List of popular projects on the platform
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {popularProjects && popularProjects.projects.length > 0 ? (
                      popularProjects.projects.map((project: any) => (
                        <TableRow key={project.id}>
                          <TableCell>{project.id}</TableCell>
                          <TableCell>{project.title}</TableCell>
                          <TableCell>{project.username}</TableCell>
                          <TableCell>{project.views}</TableCell>
                          <TableCell>{project.likes}</TableCell>
                          <TableCell>
                            {project.featured ? (
                              <span className="text-green-600 font-medium">
                                Yes
                              </span>
                            ) : (
                              <span className="text-gray-600">No</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button
                                variant={project.featured ? "destructive" : "default"}
                                size="sm"
                              >
                                {project.featured ? "Unfeature" : "Feature"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No projects found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}