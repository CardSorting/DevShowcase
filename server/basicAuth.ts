/**
 * Basic authentication system for restricting project uploads to logged-in users
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// Token storage for authentication (in-memory for simplicity)
// In a production app, this would use Redis or a database
const tokenStore = new Map<string, string>();

// Generate a random token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Login handler - would validate credentials in real implementation
export const login = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    
    // Generate a unique ID for this user if they don't exist
    let userId = `user_${Date.now()}`;
    let user = await storage.getUserByUsername(username);
    
    if (!user) {
      // Create user in database
      user = await storage.upsertUser({
        id: userId,
        username,
        firstName: username,
        email: `${username}@example.com`
      });
    }
    
    // Generate token
    const token = generateToken();
    tokenStore.set(token, user.id);
    
    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

// Logout handler
export const logout = (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    tokenStore.delete(token);
  }
  
  res.json({ message: "Logged out successfully" });
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User ID is set by isAuthenticated middleware
    const userId = (req as any).userId;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: "Failed to get user data" });
  }
};

// Authentication middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Authentication required',
      requiresAuth: true
    });
  }
  
  const token = authHeader.split(' ')[1];
  const userId = tokenStore.get(token);
  
  if (!userId) {
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      requiresAuth: true
    });
  }
  
  // Set user ID in request for later use
  (req as any).userId = userId;
  
  next();
};