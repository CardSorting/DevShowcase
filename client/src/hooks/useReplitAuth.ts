import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook for authentication using Replit's OpenID Connect
 * This hooks into the authentication system setup on the server
 */
export function useReplitAuth() {
  // Fetch the current user data if available
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const isAuthenticated = !!user;

  // Login by redirecting to the Replit login page
  const login = () => {
    window.location.href = "/api/login";
  };

  // Logout by redirecting to the logout endpoint
  const logout = () => {
    window.location.href = "/api/logout";
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error
  };
}