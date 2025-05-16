import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Github, User } from "lucide-react";

interface AuthUser {
  id: number;
  username: string;
  displayName?: string;
  avatar?: string;
}

interface AuthStatus {
  isAuthenticated: boolean;
  user?: AuthUser;
}

export default function AuthButton() {
  const { toast } = useToast();

  // Fetch authentication status with proper URL
  const { data: authStatus, isLoading, isError, error, refetch } = useQuery<AuthStatus>({
    queryKey: ["/auth/status"],
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refetch every 5 seconds to ensure up-to-date auth status
    retry: 3, // Retry failed requests
    queryFn: async () => {
      const response = await fetch('/auth/status', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch auth status');
      }
      return response.json();
    }
  });
  
  // Log any errors
  if (isError) {
    console.error('Error fetching auth status:', error);
  }

  // Handle logout with improved error handling
  const handleLogout = async () => {
    try {
      console.log("Attempting to log out...");
      
      // Direct fetch call instead of using apiRequest
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Logout response:", response);
      
      if (!response.ok) {
        throw new Error(`Logout failed: ${response.status} ${response.statusText}`);
      }
      
      // Force a refetch of auth status
      await refetch();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Force page reload to ensure all state is reset
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
      
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // GitHub login handler
  const handleGitHubLogin = () => {
    window.location.href = "/auth/github";
  };

  // Show loading state
  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <User className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  // Show login button if not authenticated
  if (!authStatus?.isAuthenticated) {
    console.log("Auth Status: Not authenticated", authStatus);
    return (
      <Button 
        onClick={handleGitHubLogin} 
        variant="default" 
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Github className="h-4 w-4 mr-2" />
        Login with GitHub
      </Button>
    );
  }
  
  console.log("Auth Status: Authenticated", authStatus);

  // Show user profile dropdown if authenticated
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {authStatus.user?.avatar ? (
              <AvatarImage 
                src={authStatus.user.avatar} 
                alt={authStatus.user.displayName || authStatus.user.username} 
              />
            ) : (
              <AvatarFallback>
                {authStatus.user?.displayName?.[0]?.toUpperCase() || 
                 authStatus.user?.username?.[0]?.toUpperCase() || 
                 "U"}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{authStatus.user?.displayName || authStatus.user?.username}</p>
            <p className="text-sm text-muted-foreground">@{authStatus.user?.username}</p>
          </div>
        </div>
        <DropdownMenuItem asChild>
          <a href="/my/projects" className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            My Projects
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" /> 
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}