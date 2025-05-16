import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import connectPgSimple from 'connect-pg-simple';

// Add type declarations for session data
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    visitorId?: string;
  }
}

// Add user property to Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const PgSession = connectPgSimple(session);

// Configure session middleware
export function setupSessions(app: express.Express) {
  // Set up session store with PostgreSQL
  app.use(
    session({
      store: new PgSession({
        conObject: {
          connectionString: process.env.DATABASE_URL,
        },
        tableName: 'sessions',
        createTableIfMissing: true
      }),
      secret: process.env.SESSION_SECRET || 'development-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      }
    })
  );
}

// Authentication middleware
export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify the user exists in database
    const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
    
    if (!user) {
      // Clear invalid session
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
}

// Role-based authorization middleware
export function hasRole(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const userRole = (req.user as any).role;
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
}

// Login handler
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    
    // Get user from database
    const [user] = await db.select().from(users).where(eq(users.username, username));
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // For demo purposes - in a real app, compare hashed passwords
    if (password !== 'demo') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Set user ID in session
    req.session.userId = user.id;
    
    // Update last login time
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
}

// Logout handler
export async function logout(req: Request, res: Response) {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
}

// Register handler
export async function register(req: Request, res: Response) {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password required' });
    }
    
    // Check if username already exists
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.username, username));
    
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    // Create user with default role 'user'
    const [newUser] = await db.insert(users)
      .values({
        id: `local-${Date.now()}`, // Generate an ID for local users
        username,
        email,
        firstName,
        lastName,
        role: 'user',
        isActive: true
      })
      .returning();
    
    // Set user ID in session
    req.session.userId = newUser.id;
    
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
}

// Get current user
export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, req.session.userId));
    
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImageUrl: user.profileImageUrl
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get current user' });
  }
}