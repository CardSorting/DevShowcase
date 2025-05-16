import { Router } from 'express';
import passport from './auth';

const router = Router();

// Route to initiate GitHub authentication
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback route
router.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: '/login',
    successRedirect: '/'
  })
);

// Check if user is authenticated
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
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
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

export default router;