/**
 * Authentication Service
 * 
 * Follows the principles of Clean Architecture and Domain-Driven Design
 * Handles user authentication and authorization
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

interface AuthUser {
  id: string;
  username: string;
  email?: string;
}

// Mock session data - in a real implementation this would be stored in the database
const sessions: Record<string, AuthUser> = {};

/**
 * Middleware to check if user is authenticated
 * Implements authorization boundary in Clean Architecture
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Get the session token from the request
  const sessionToken = req.headers.authorization?.split(' ')[1];
  
  if (!sessionToken || !sessions[sessionToken]) {
    return res.status(401).json({
      message: 'Unauthorized - You must be logged in to perform this action',
      requiresAuth: true
    });
  }
  
  // Attach the user to the request
  (req as any).user = sessions[sessionToken];
  next();
};

/**
 * Generate a random session token
 */
const generateSessionToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Login handler - would validate credentials in real implementation
 */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  try {
    // In a real implementation, we would validate credentials against the database
    // For now, we'll create a mock user
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      // For demo, create a user if not exists
      const newUser = await storage.upsertUser({
        id: Date.now().toString(),
        username,
        email: `${username}@example.com`
      });
      
      const token = generateSessionToken();
      sessions[token] = {
        id: newUser.id,
        username: newUser.username || username,
        email: newUser.email || undefined
      };
      
      return res.json({ token, user: newUser });
    }
    
    // Generate session token
    const token = generateSessionToken();
    sessions[token] = {
      id: user.id,
      username: user.username || username,
      email: user.email || undefined
    };
    
    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

/**
 * Logout handler
 */
export const logout = (req: Request, res: Response) => {
  const sessionToken = req.headers.authorization?.split(' ')[1];
  
  if (sessionToken) {
    delete sessions[sessionToken];
  }
  
  res.json({ message: 'Logged out successfully' });
};

/**
 * Get current user
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  try {
    const dbUser = await storage.getUser(user.id);
    res.json(dbUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to retrieve user information' });
  }
};