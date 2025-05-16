import express from 'express';
import { storage } from './storage';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create a simple auth router without requiring passport
const authRouter = express.Router();

// GitHub login route that redirects to GitHub OAuth
authRouter.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID || '';
  const redirectUri = encodeURIComponent(process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/auth/github/callback');
  const scope = 'user:email';
  
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`);
});

// GitHub callback route
authRouter.get('/callback/github', async (req, res) => {
  try {
    const code = req.query.code as string;
    
    if (!code) {
      return res.redirect('/?error=oauth_failed');
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      return res.redirect('/?error=token_exchange_failed');
    }
    
    // Get user profile from GitHub
    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'DevShowcase-App'
      }
    });
    
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'DevShowcase-App'
      }
    });
    
    const profile = await profileResponse.json();
    const emails = await emailsResponse.json();
    
    // Check if user already exists with GitHub ID
    let user = await storage.getUserByGithubId(profile.id);
    
    if (!user) {
      // User doesn't exist, create a new user
      const username = profile.login || `github_${profile.id}`;
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(username);
      
      // If username is taken, append a random number to make it unique
      const finalUsername = existingUser 
        ? `${username}_${Math.floor(Math.random() * 10000)}`
        : username;
      
      // Create new user
      user = await storage.createUser({
        username: finalUsername,
        githubId: profile.id.toString(),
        displayName: profile.name || finalUsername,
        avatarUrl: profile.avatar_url,
        email: emails[0]?.email,
      });
    }
    
    // Store user in session
    if (req.session) {
      req.session.user = user;
      req.session.isAuthenticated = true;
    }
    
    res.redirect('/');
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect('/?error=github_auth_failed');
  }
});

// Auth status route
authRouter.get('/status', (req, res) => {
  if (req.session?.isAuthenticated && req.session?.user) {
    const user = req.session.user;
    res.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatarUrl
      }
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Logout route
authRouter.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ success: true });
    });
  } else {
    res.json({ success: true });
  }
});

export default authRouter;