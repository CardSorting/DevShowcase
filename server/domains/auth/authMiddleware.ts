import { Request, Response, NextFunction } from 'express';
import { AuthService } from './authService';
import { storage } from '../../storage';

// Create auth service instance
const authService = new AuthService(storage);

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: string;
      };
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract token from Bearer header
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      // Extract token from cookie
      token = req.cookies.token;
    }
    
    // If no token found, return unauthorized
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = await authService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Set user in request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Role-based access control middleware
export const authorize = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if request has user property (set by authenticate middleware)
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user has permission
      const hasPermission = await authService.hasPermission(
        req.user.userId,
        resource,
        action
      );
      
      // If no permission, return forbidden
      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'You do not have permission to perform this action' 
        });
      }
      
      // User has permission, continue
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Authorization failed' });
    }
  };
};

// Role-specific middleware
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if request has user property (set by authenticate middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have the required role to access this resource' 
      });
    }
    
    // User has required role, continue
    next();
  };
};