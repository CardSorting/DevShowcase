import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IStorage } from '../../storage';
import { User, InsertUser } from '@shared/schema';

// Domain interfaces
export interface IAuthService {
  // Auth methods
  register(userData: InsertUser): Promise<{ user: Omit<User, 'password'>, token: string }>;
  login(username: string, password: string): Promise<{ user: Omit<User, 'password'>, token: string } | null>;
  verifyToken(token: string): Promise<{ userId: number, role: string } | null>;
  // Role-based methods
  hasPermission(userId: number, resource: string, action: string): Promise<boolean>;
  getUserPermissions(userId: number): Promise<string[]>;
}

export class AuthService implements IAuthService {
  private storage: IStorage;
  private readonly JWT_SECRET: string;
  private readonly SALT_ROUNDS = 10;
  private readonly TOKEN_EXPIRY = '24h';

  constructor(storage: IStorage) {
    this.storage = storage;
    // In production, use environment variable for JWT secret
    this.JWT_SECRET = process.env.JWT_SECRET || 'temporaryDevSecret-pleaseChangeInProduction';
  }

  // Hash password before storing
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Compare password with stored hash
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  private generateToken(userId: number, role: string): string {
    return jwt.sign(
      { userId, role },
      this.JWT_SECRET,
      { expiresIn: this.TOKEN_EXPIRY }
    );
  }

  // Register new user
  async register(userData: InsertUser): Promise<{ user: Omit<User, 'password'>, token: string }> {
    // Hash password before storing
    const hashedPassword = await this.hashPassword(userData.password);
    
    // Create user with hashed password
    const user = await this.storage.createUser({
      ...userData,
      password: hashedPassword
    });

    // Update last login
    await this.storage.updateUser(user.id, { lastLogin: new Date() });
    
    // Generate JWT token
    const token = this.generateToken(user.id, user.role);
    
    // Return user (without password) and token
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
  
  // Login user
  async login(username: string, password: string): Promise<{ user: Omit<User, 'password'>, token: string } | null> {
    // Get user by username
    const user = await this.storage.getUserByUsername(username);
    if (!user) return null;
    
    // Check if user is active
    if (!user.isActive) return null;
    
    // Compare password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) return null;
    
    // Update last login
    await this.storage.updateUser(user.id, { lastLogin: new Date() });
    
    // Generate JWT token
    const token = this.generateToken(user.id, user.role);
    
    // Return user (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
  
  // Verify JWT token
  async verifyToken(token: string): Promise<{ userId: number, role: string } | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: number, role: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }
  
  // Check if user has permission to perform action on resource
  async hasPermission(userId: number, resource: string, action: string): Promise<boolean> {
    // Get user
    const user = await this.storage.getUser(userId);
    if (!user || !user.isActive) return false;
    
    // Admin role has all permissions by default
    if (user.role === 'admin') return true;
    
    // For other roles, check specific permissions
    const permissions = await this.storage.getUserPermissions(userId);
    
    // Check if user has required permission
    return permissions.some(p => 
      p.resource === resource && p.action === action
    );
  }
  
  // Get all permissions for a user
  async getUserPermissions(userId: number): Promise<string[]> {
    const permissions = await this.storage.getUserPermissions(userId);
    return permissions.map(p => `${p.resource}:${p.action}`);
  }
}