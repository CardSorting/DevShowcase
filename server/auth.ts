import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { storage } from './storage';
import dotenv from 'dotenv';
import { User } from '@shared/schema';

// Load environment variables from .env file
dotenv.config();

// Configure Passport with GitHub strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/auth/github/callback'
  },
  async (accessToken: string, refreshToken: string, profile: any, done: (error: Error | null, user?: any) => void) => {
    try {
      // Check if user already exists with GitHub ID
      let user = await storage.getUserByGithubId(profile.id);
      
      if (!user) {
        // User doesn't exist, create a new user
        const username = profile.username || `github_${profile.id}`;
        
        // Check if username is already taken
        const existingUser = await storage.getUserByUsername(username);
        
        // If username is taken, append a random number to make it unique
        const finalUsername = existingUser 
          ? `${username}_${Math.floor(Math.random() * 10000)}`
          : username;
        
        // Create new user
        user = await storage.createUser({
          username: finalUsername,
          githubId: profile.id,
          displayName: profile.displayName || finalUsername,
          avatarUrl: profile.photos?.[0]?.value,
          email: profile.emails?.[0]?.value,
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }
));

// Define types for passport serialization
declare global {
  namespace Express {
    interface User extends User {}
  }
}

// Serialize user ID to session
passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

// Deserialize user from session ID
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;