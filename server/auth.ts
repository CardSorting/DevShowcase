import passport from 'passport';
import session from 'express-session';
import type { Express, RequestHandler, Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import * as crypto from 'crypto';
import { db } from './db';
import { sessions } from '../shared/schema';
import ConnectPgSimple from 'connect-pg-simple';

// Import passport-local differently to handle CommonJS module
const LocalStrategy = require('passport-local').Strategy;

// Session configuration
export function setupSession(app: Express) {
  const PgStore = ConnectPgSimple(session);
  
  app.use(
    session({
      store: new PgStore({
        tableName: 'sessions',
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || 'dev-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    })
  );
}

// Password utilities
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function verifyPassword(inputPassword: string, storedHash: string, salt: string): boolean {
  const inputHash = hashPassword(inputPassword, salt);
  return inputHash === storedHash;
}

// Passport setup
export function setupPassport(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // In a real implementation, fetch user from the database
        // For now, we'll use a simple hardcoded admin user
        if (username === 'admin' && password === 'password') {
          return done(null, { id: '1', username: 'admin' });
        }
        return done(null, false, { message: 'Invalid username or password' });
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialization for session storage
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      // For now just return a simple object for the admin user
      if (id === '1') {
        return done(null, { id: '1', username: 'admin' });
      }
      done(null, false);
    } catch (error) {
      done(error);
    }
  });
}

// Authentication routes
export function registerAuthRoutes(app: Express) {
  // Login route
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err: Error, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ success: true, user });
      });
    })(req, res, next);
  });

  // Logout route
  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  // Get current user
  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};