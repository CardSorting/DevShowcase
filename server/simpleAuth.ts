/**
 * Simple authentication system for restricting project uploads to logged-in users
 * This is a lightweight alternative to Replit Auth that doesn't require external modules
 */

import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { Express } from 'express';
import { storage } from './storage';
import { z } from 'zod';

// Login credentials validation schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters")
});

// Simple in-memory user store (in a real app, this would use the database)
// For demo purposes only
const demoUsers = [
  {
    id: "demo1",
    username: "demo",
    password: "demo1234",
    email: "demo@example.com",
    firstName: "Demo",
    lastName: "User",
    profileImageUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=demo"
  }
];

// Setup session middleware
export function setupAuth(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));
}

// Login handler
export async function login(req: Request, res: Response) {
  try {
    const validation = loginSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid credentials", 
        errors: validation.error.errors 
      });
    }
    
    const { username, password } = validation.data;
    
    // Demo authentication for development (in real app, use database)
    const user = demoUsers.find(u => 
      u.username === username && u.password === password
    );
    
    if (!user) {
      // For demo purposes, create a user account automatically
      // In a real app, this would be a proper authentication check
      
      const newUserId = `user-${Date.now()}`;
      const newUser = {
        id: newUserId,
        username,
        email: `${username}@example.com`,
        firstName: username,
        lastName: "User",
        profileImageUrl: `https://api.dicebear.com/6.x/avataaars/svg?seed=${username}`
      };
      
      // Save the user to the database using our storage
      await storage.upsertUser({
        id: newUserId,
        username,
        email: `${username}@example.com`,
        firstName: username,
        lastName: "User",
        profileImageUrl: `https://api.dicebear.com/6.x/avataaars/svg?seed=${username}`
      });
      
      // Set session data
      (req.session as any).userId = newUserId;
      (req.session as any).user = newUser;
      
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: newUser
      });
    }
    
    // Set session data
    (req.session as any).userId = user.id;
    (req.session as any).user = user;
    
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      message: "An error occurred during login" 
    });
  }
}

// Logout handler
export function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    
    res.status(200).json({ message: "Logged out successfully" });
  });
}

// Current user handler
export async function getCurrentUser(req: Request, res: Response) {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  try {
    // Get user from the database
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return user data without sensitive information
    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    return res.status(500).json({ message: "Failed to retrieve user data" });
  }
}

// Authentication middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ 
      message: "Authentication required",
      requiresAuth: true
    });
  }
  
  // Add userId to request for later use
  (req as any).userId = userId;
  
  next();
}