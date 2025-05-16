import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Search, Heart, Bell, Code, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AuthButton from "./AuthButton";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  
  // Fetch authentication status
  const { data: authStatus } = useQuery({
    queryKey: ["/auth/status"],
    retry: 1,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to gallery with search query
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
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
            <button className="text-gray-500 hover:text-primary">
              <Heart className="h-5 w-5" />
            </button>
            <button className="text-gray-500 hover:text-primary">
              <Bell className="h-5 w-5" />
            </button>
            
            {/* Show My Projects button when user is authenticated */}
            {authStatus?.isAuthenticated && (
              <Link href="/my/projects" className="flex items-center text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium">
                <User className="h-4 w-4 mr-1" />
                My Projects
              </Link>
            )}
            
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
