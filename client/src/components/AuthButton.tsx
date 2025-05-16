import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useReplitAuth } from "../hooks/useReplitAuth";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

/**
 * Authentication button for the application
 * Shows login button or user info based on auth state
 */
export function AuthButton() {
  const { user, isAuthenticated, login, logout, isLoading } = useReplitAuth();
  
  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <span className="animate-pulse">Loading...</span>
      </Button>
    );
  }
  
  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 p-1 px-2 h-auto">
            <div className="flex flex-col items-end mr-2 text-sm">
              <span className="font-medium">{user.firstName || user.email || 'User'}</span>
              {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
            </div>
            <Avatar className="h-8 w-8">
              {user.profileImageUrl ? (
                <AvatarImage src={user.profileImageUrl} alt={user.firstName || 'User'} />
              ) : (
                <AvatarFallback>
                  {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={logout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <Button onClick={login} className="flex items-center gap-2">
      <User className="h-4 w-4" />
      <span>Log in</span>
    </Button>
  );
}