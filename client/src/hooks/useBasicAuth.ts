import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Types for auth operations
interface LoginCredentials {
  username: string;
  password?: string; // Optional for our simple auth
}

interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Custom hook for authentication using our basic auth system
 * Handles logging in, logging out, and checking authentication status
 */
export function useBasicAuth() {
  const queryClient = useQueryClient();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Get auth token from localStorage
  const getToken = (): string | null => {
    return localStorage.getItem('auth_token');
  };
  
  // Set the auth token in localStorage
  const setToken = (token: string): void => {
    localStorage.setItem('auth_token', token);
  };
  
  // Remove the auth token from localStorage
  const clearToken = (): void => {
    localStorage.removeItem('auth_token');
  };
  
  // Check if user is authenticated based on token presence
  const hasToken = !!getToken();

  // Fetch the current user if authenticated
  const { 
    data: user, 
    isLoading,
    isError 
  } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: hasToken, // Only run if we have a token
    retry: false
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
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
    onSuccess: (data) => {
      // Save the token
      setToken(data.token);
      
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
      // Get token for the Authorization header
      const token = getToken();
      
      if (!token) {
        throw new Error("Not logged in");
      }
      
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Logout failed");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Clear the token
      clearToken();
      
      // Clear user data after logout
      queryClient.invalidateQueries({queryKey: ["/api/auth/user"]});
      queryClient.resetQueries({queryKey: ["/api/auth/user"]});
    }
  });
  
  // Public login function
  const login = (credentials: LoginCredentials) => {
    loginMutation.mutate(credentials);
  };
  
  // Public logout function
  const logout = () => {
    logoutMutation.mutate();
  };
  
  // Add auth header to requests
  const addAuthHeader = (headers: Record<string, string>): Record<string, string> => {
    const token = getToken();
    
    if (token) {
      return {
        ...headers,
        Authorization: `Bearer ${token}`
      };
    }
    
    return headers;
  };
  
  return {
    user,
    isLoading,
    isAuthenticated: hasToken && !!user,
    login,
    logout,
    loginError,
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    addAuthHeader
  };
}