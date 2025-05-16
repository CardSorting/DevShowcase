import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Types for auth operations
interface LoginCredentials {
  username: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

/**
 * Custom hook for authentication using our simple auth system
 */
export function useSimpleAuth() {
  const queryClient = useQueryClient();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Fetch the current user if available
  const { 
    data: user, 
    isLoading,
    isError 
  } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      setLoginError(null);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate the user query to refetch user data
      queryClient.invalidateQueries({queryKey: ["/api/auth/user"]});
    },
    onError: (error: Error) => {
      setLoginError(error.message);
    }
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Logout failed");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Clear user data after logout
      queryClient.invalidateQueries({queryKey: ["/api/auth/user"]});
    }
  });
  
  const login = (credentials: LoginCredentials) => {
    loginMutation.mutate(credentials);
  };
  
  const logout = () => {
    logoutMutation.mutate();
  };
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    loginError,
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending
  };
}