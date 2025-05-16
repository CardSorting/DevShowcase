import { Request, Response } from 'express';
import { AuthService } from './authService';
import { storage } from '../../storage';
import { check, validationResult } from 'express-validator';

// Create auth service instance
const authService = new AuthService(storage);

// Login validation rules
export const loginValidationRules = [
  check('username').notEmpty().withMessage('Username is required'),
  check('password').notEmpty().withMessage('Password is required'),
];

// Registration validation rules
export const registerValidationRules = [
  check('username').notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  check('email').notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid'),
  check('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Authentication controllers
export const authController = {
  // Login controller
  login: async (req: Request, res: Response) => {
    try {
      // Validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Extract username and password from request body
      const { username, password } = req.body;
      
      // Attempt login
      const result = await authService.login(username, password);
      
      // If login failed, return error
      if (!result) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Set JWT token as cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
      
      // Return user info (without password)
      res.json({
        message: 'Login successful',
        user: result.user,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'An error occurred during login' });
    }
  },
  
  // Register controller
  register: async (req: Request, res: Response) => {
    try {
      // Validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Extract user data from request body
      const { username, email, password, firstName, lastName } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already exists' });
      }
      
      // Register user
      const result = await authService.register({
        username,
        email,
        password,
        firstName,
        lastName,
        role: 'user', // Default role for new users
        isActive: true,
      });
      
      // Set JWT token as cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
      
      // Return user info (without password)
      res.status(201).json({
        message: 'Registration successful',
        user: result.user,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'An error occurred during registration' });
    }
  },
  
  // Logout controller
  logout: (req: Request, res: Response) => {
    try {
      // Clear the token cookie
      res.clearCookie('token');
      
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'An error occurred during logout' });
    }
  },
  
  // Get current user controller
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Get user details from database
      const user = await storage.getUser(req.user.userId);
      
      // If user not found or inactive, return error
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'User not found or inactive' });
      }
      
      // Return user info (without password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'An error occurred while fetching user data' });
    }
  },
};