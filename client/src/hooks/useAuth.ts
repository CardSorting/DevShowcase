import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { User, useAuthStatus } from "../lib/authClient";

/**
 * Custom hook for handling user authentication
 * Integrates with TanStack Query for data fetching
 */
export function useAuth() {
  const { isAuthenticated, token } = useAuthStatus();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Only fetch user data if we have an auth token
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: isAuthenticated,
    retry: false
  });

  // Track initial loading state to avoid flash of unauthenticated UI
  useEffect(() => {
    if (!isLoading || error) {
      setIsInitialLoading(false);
    }
  }, [isLoading, error]);

  return {
    user: user as User,
    isLoading: isInitialLoading || isLoading,
    isAuthenticated: isAuthenticated && !!user,
    error
  };
}