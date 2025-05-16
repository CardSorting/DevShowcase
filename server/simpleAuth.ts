import session from 'express-session';
import type { Express, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Add express middleware for parsing JSON request bodies
import express from 'express';

// Simple session-based auth middleware
export function setupAuth(app: Express) {
  // Add middleware to parse JSON bodies
  app.use(express.json());
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      }
    })
  );

  // Initialize session handling
  app.use((req: any, res, next) => {
    // Make the user data available in templates
    res.locals.user = req.session.user || null;
    next();
  });
}

// User authentication check middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).user) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};

// Register authentication routes
export function registerAuthRoutes(app: Express) {
  // Simplified login endpoint (demo only)
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // For demo purposes, we'll create a simple demo user
      // In a real app, you would check credentials against the database
      if (username === 'demo' && password === 'password') {
        // Create a demo user if it doesn't exist
        let user = await db.select().from(users).where(eq(users.id, 'demo-user')).limit(1);
        
        if (!user.length) {
          const [newUser] = await db.insert(users).values({
            id: 'demo-user',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            profileImageUrl: 'https://ui-avatars.com/api/?name=Demo+User'
          }).returning();
          user = [newUser];
        }
        
        // Store user in session
        (req.session as any).user = user[0];
        
        return res.json({ success: true, user: user[0] });
      }
      
      return res.status(401).json({ message: 'Invalid username or password' });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'An error occurred during login' });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.clearCookie('connect.sid');
      return res.json({ success: true });
    });
  });

  // Get current user
  app.get('/api/auth/user', (req: Request, res: Response) => {
    const user = (req.session as any).user;
    if (user) {
      return res.json(user);
    }
    return res.status(401).json({ message: 'Not authenticated' });
  });
}