import { Router } from 'express';
import { authController, loginValidationRules, registerValidationRules } from './authController';
import { authenticate, requireRole } from './authMiddleware';

// Create router
const router = Router();

// Public auth routes
router.post('/login', loginValidationRules, authController.login);
router.post('/register', registerValidationRules, authController.register);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

// Admin-only routes
router.get('/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const users = await req.app.locals.storage.getUsersByRole('user');
    res.json(users.map(({ password, ...user }) => user));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Protected routes example
router.get('/admin/dashboard', authenticate, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin dashboard accessed successfully' });
});

router.get('/developer/dashboard', authenticate, requireRole(['developer', 'admin']), (req, res) => {
  res.json({ message: 'Developer dashboard accessed successfully' });
});

export default router;