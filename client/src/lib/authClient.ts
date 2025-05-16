import { queryClient, apiRequest } from './queryClient';

/**
 * Authentication client for handling user authentication
 * Integrates with the server's authentication system
 */

// Types for auth operations
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

export interface User {
  id: string;
  username: string;
}

// Token management
const TOKEN_KEY = 'auth_token';

const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Authentication operations
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiRequest('POST', '/api/auth/login', credentials);
  const data = await response.json();
  
  // Save authentication token
  setToken(data.token);
  
  // Invalidate cached user data to trigger a refresh
  queryClient.invalidateQueries({queryKey: ['/api/auth/me']});
  
  return data;
};

export const logout = async (): Promise<void> => {
  const token = getToken();
  
  if (token) {
    await apiRequest('POST', '/api/auth/logout');
    clearToken();
    
    // Clear cached user data
    queryClient.invalidateQueries({queryKey: ['/api/auth/me']});
  }
};

/**
 * Hook for checking if a user is logged in
 * Uses React Query for data fetching
 */
export const useAuthStatus = () => {
  const token = getToken();
  
  return {
    isAuthenticated: !!token,
    token
  };
};

// Add authentication headers to API requests
export const addAuthHeader = (headers: Record<string, string>): Record<string, string> => {
  const token = getToken();
  
  if (token) {
    return {
      ...headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  return headers;
};