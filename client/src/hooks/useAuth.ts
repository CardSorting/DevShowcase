import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export type User = {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'developer' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export function useAuth() {
  const queryClient = useQueryClient();

  // Get current user
  const { 
    data: user, 
    isLoading,
    error,
    isError
  } = useQuery<User>({ 
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  // Login mutation
  const login = useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      apiRequest('/api/auth/login', 'POST', credentials),
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  // Register mutation
  const register = useMutation({
    mutationFn: (data: RegisterData) => 
      apiRequest('/api/auth/register', 'POST', data),
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: () => 
      apiRequest('/api/auth/logout', 'POST'),
    onSuccess: () => {
      // Clear user data and refetch
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === 'admin',
    isDeveloper: user?.role === 'developer' || user?.role === 'admin',
    login,
    register,
    logout,
    error,
    isError
  };
}