import { useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Calendar, 
  Star,
  Upload,
  Heart,
  Settings
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your profile",
        variant: "destructive"
      });
      navigate("/login?redirect=/profile");
    }
  }, [isAuthenticated, navigate, toast]);

  // Don't render anything if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Your Profile - DevShowcase</title>
        <meta name="description" content="Manage your profile, view your uploaded projects, and adjust your account settings." />
      </Helmet>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Profile sidebar */}
          <div className="w-full md:w-1/3 space-y-4">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Avatar className="h-24 w-24">
                    {user.profileImageUrl ? (
                      <AvatarImage src={user.profileImageUrl} alt={user.username} />
                    ) : (
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{user.username}</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                  <a href={`/user/${user.id}/projects`}>
                    <Upload className="mr-2 h-4 w-4" />
                    View My Projects
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-md">Account Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Project
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/favorites">
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </a>
                </Button>
                {(user.role === 'admin' || user.role === 'developer') && (
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href={user.role === 'admin' ? '/admin/dashboard' : '/developer/dashboard'}>
                      <Star className="mr-2 h-4 w-4" />
                      Dashboard
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main content area */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="profile">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and public profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="First Name" 
                          defaultValue={user.firstName || ''} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Last Name" 
                          defaultValue={user.lastName || ''} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          id="username" 
                          placeholder="Username" 
                          defaultValue={user.username} 
                          disabled
                        />
                        <Button variant="outline" disabled>Change</Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Username cannot be changed after registration
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="Email"
                        defaultValue={user.email} 
                        disabled
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea 
                        id="bio"
                        className="w-full min-h-[100px] p-3 border rounded-md"
                        placeholder="Tell others about yourself..."
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button>
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Projects</CardTitle>
                    <CardDescription>
                      View and manage projects you've uploaded
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Upload className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No projects uploaded yet</h3>
                      <p className="text-gray-500 mb-4">
                        Share your creations with the community. Upload your first project now!
                      </p>
                      <Button asChild>
                        <a href="/upload">
                          Upload Project
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Password</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input 
                            id="currentPassword" 
                            type="password" 
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input 
                            id="newPassword" 
                            type="password" 
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input 
                            id="confirmPassword" 
                            type="password" 
                            placeholder="••••••••"
                          />
                        </div>
                        <Button className="mt-2">
                          Update Password
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-4">Danger Zone</h3>
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
}