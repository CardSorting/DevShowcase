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
  
  // Use the exact callback URL as configured in GitHub OAuth application
  // This ensures the redirect_uri parameter exactly matches what GitHub expects
  const redirectUri = encodeURIComponent(process.env.GITHUB_CALLBACK_URL || '');
  const scope = 'user:email';
  
  console.log('Redirecting to GitHub OAuth with redirect URI:', redirectUri);
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`);
});

// GitHub callback routes - supporting both URL patterns
// This route handles the callback from GitHub using the URL pattern in your application
authRouter.get('/github/callback', async (req, res) => {
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
      console.error('Failed to get access token:', tokenData);
      return res.redirect('/?error=token_exchange_failed');
    }
    
    console.log('Successfully obtained GitHub access token');
    
    // Get user profile from GitHub
    console.log('Fetching GitHub user profile...');
    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': 'DevShowcase-App'
      }
    });
    
    if (!profileResponse.ok) {
      console.error('Failed to fetch GitHub profile:', await profileResponse.text());
      return res.redirect('/?error=github_profile_failed');
    }
    
    console.log('Fetching GitHub user emails...');
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': 'DevShowcase-App'
      }
    });
    
    if (!emailsResponse.ok) {
      console.error('Failed to fetch GitHub emails:', await emailsResponse.text());
    }
    
    const profile = await profileResponse.json();
    const emails = await emailsResponse.json();
    
    console.log('Processing GitHub profile:', {
      id: profile.id,
      login: profile.login,
      name: profile.name
    });
    
    // Check if user already exists with GitHub ID
    let user = await storage.getUserByGithubId(profile.id.toString());
    console.log('Existing user by GitHub ID:', user);
    
    if (!user) {
      // User doesn't exist, create a new user
      const username = profile.login || `github_${profile.id}`;
      console.log('Checking if username is taken:', username);
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(username);
      
      // If username is taken, append a random number to make it unique
      const finalUsername = existingUser 
        ? `${username}_${Math.floor(Math.random() * 10000)}`
        : username;
      
      const email = Array.isArray(emails) && emails.length > 0 ? emails[0].email : null;
      console.log('Creating new user with data:', {
        username: finalUsername,
        githubId: profile.id.toString(),
        displayName: profile.name || finalUsername,
        avatarUrl: profile.avatar_url,
        email
      });
      
      // Create new user
      try {
        user = await storage.createUser({
          username: finalUsername,
          githubId: profile.id.toString(),
          displayName: profile.name || finalUsername,
          avatarUrl: profile.avatar_url,
          email,
        });
        console.log('Successfully created user:', user);
      } catch (error) {
        console.error('Failed to create user:', error);
        return res.redirect('/?error=user_creation_failed');
      }
    } else {
      console.log('Found existing user:', user);
    }
    
    // Store user in session
    if (req.session) {
      console.log('Saving user to session...');
      req.session.user = user;
      req.session.isAuthenticated = true;
      // Force session save
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Failed to save session:', err);
            reject(err);
          } else {
            console.log('Successfully saved session');
            resolve();
          }
        });
      });
    } else {
      console.error('No session object available!');
    }
    
    res.redirect('/');
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect('/?error=github_auth_failed');
  }
});

// Auth status route
authRouter.get('/status', (req, res) => {
  console.log('Auth status request received');
  console.log('Session:', req.session);
  
  if (req.session?.isAuthenticated && req.session?.user) {
    const user = req.session.user;
    console.log('User authenticated, returning user data:', user);
    
    const userData = {
      isAuthenticated: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatarUrl
      }
    };
    
    console.log('Sending user data:', userData);
    res.json(userData);
  } else {
    console.log('User not authenticated');
    res.json({ isAuthenticated: false });
  }
});

// Logout route with better error handling
authRouter.post('/logout', (req, res) => {
  console.log('Logout request received');
  
  if (req.session) {
    console.log('Destroying session...');
    
    // Clear user data and authentication flag
    req.session.user = undefined;
    req.session.isAuthenticated = false;
    
    // Destroy the session
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Logout failed', error: err.message });
      }
      
      console.log('Session successfully destroyed');
      
      // Clear the cookie as well
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  } else {
    console.log('No session to destroy');
    res.json({ success: true });
  }
});

// Add an additional callback route with the alternate URL pattern
// This handles the callback from GitHub using the URL pattern expected by GitHub
authRouter.get('/callback/github', async (req, res) => {
  try {
    console.log('Received GitHub callback on alternate route');
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
      console.error('Failed to get access token:', tokenData);
      return res.redirect('/?error=token_exchange_failed');
    }
    
    console.log('Successfully obtained GitHub access token');
    
    // Get user profile from GitHub
    console.log('Fetching GitHub user profile...');
    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': 'DevShowcase-App'
      }
    });
    
    if (!profileResponse.ok) {
      console.error('Failed to fetch GitHub profile:', await profileResponse.text());
      return res.redirect('/?error=github_profile_failed');
    }
    
    console.log('Fetching GitHub user emails...');
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': 'DevShowcase-App'
      }
    });
    
    if (!emailsResponse.ok) {
      console.error('Failed to fetch GitHub emails:', await emailsResponse.text());
    }
    
    const profile = await profileResponse.json();
    const emails = await emailsResponse.json();
    
    console.log('Processing GitHub profile:', {
      id: profile.id,
      login: profile.login,
      name: profile.name
    });
    
    // Check if user already exists with GitHub ID
    let user = await storage.getUserByGithubId(profile.id.toString());
    console.log('Existing user by GitHub ID:', user);
    
    if (!user) {
      // User doesn't exist, create a new user
      const username = profile.login || `github_${profile.id}`;
      console.log('Checking if username is taken:', username);
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(username);
      
      // If username is taken, append a random number to make it unique
      const finalUsername = existingUser 
        ? `${username}_${Math.floor(Math.random() * 10000)}`
        : username;
      
      const email = Array.isArray(emails) && emails.length > 0 ? emails[0].email : null;
      console.log('Creating new user with data:', {
        username: finalUsername,
        githubId: profile.id.toString(),
        displayName: profile.name || finalUsername,
        avatarUrl: profile.avatar_url,
        email
      });
      
      // Create new user
      try {
        user = await storage.createUser({
          username: finalUsername,
          githubId: profile.id.toString(),
          displayName: profile.name || finalUsername,
          avatarUrl: profile.avatar_url,
          email,
        });
        console.log('Successfully created user:', user);
      } catch (error) {
        console.error('Failed to create user:', error);
        return res.redirect('/?error=user_creation_failed');
      }
    } else {
      console.log('Found existing user:', user);
    }
    
    // Store user in session
    if (req.session) {
      console.log('Saving user to session...');
      req.session.user = user;
      req.session.isAuthenticated = true;
      // Force session save
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Failed to save session:', err);
            reject(err);
          } else {
            console.log('Successfully saved session');
            resolve();
          }
        });
      });
    } else {
      console.error('No session object available!');
    }
    
    res.redirect('/');
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect('/?error=github_auth_failed');
  }
});

export default authRouter;