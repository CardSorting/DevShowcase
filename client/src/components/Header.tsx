import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Heart, Bell, Code, LogOut, LogIn, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to gallery with search query
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };
  
  // Get display name from user info
  const getDisplayName = () => {
    if (!user) return "U";
    return user.firstName?.[0] || user.email?.[0] || "U";
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Code className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-xl text-textColor">DevShowcase</span>
            </Link>
          </div>
          
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-3 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/upload" className="text-gray-500 hover:text-primary">
                  <Upload className="h-5 w-5" />
                </Link>
                <button className="text-gray-500 hover:text-primary">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="text-gray-500 hover:text-primary">
                  <Bell className="h-5 w-5" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      <Avatar className="h-8 w-8">
                        {user?.profileImageUrl && (
                          <AvatarImage src={user.profileImageUrl} alt="Profile" />
                        )}
                        <AvatarFallback>{getDisplayName()}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/profile" className="w-full">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/my-projects" className="w-full">My Projects</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <a href="/api/logout" className="w-full">Log out</a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild>
                <a href="/api/login" className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Log in
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
