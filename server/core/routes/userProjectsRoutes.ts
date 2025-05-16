import { Router } from 'express';
import { UserProjectsController } from '../presentation/UserProjectsController';
import { authenticate } from '../../domains/auth/authMiddleware';

// Initialize router
const router = Router();
const controller = new UserProjectsController();

// Get all projects with analytics for a user - requires authentication
router.get('/user/:userId/projects', authenticate, (req, res) => controller.getUserProjects(req, res));

// Get single project with analytics for a user
router.get('/user/:userId/projects/:projectId', authenticate, (req, res) => controller.getProjectWithAnalytics(req, res));

// Get detailed analytics for a specific project
router.get('/user/:userId/projects/:projectId/analytics', authenticate, (req, res) => controller.getProjectAnalytics(req, res));

// Get engagement metrics for a specific project
router.get('/user/:userId/projects/:projectId/engagement', authenticate, (req, res) => controller.getProjectEngagement(req, res));

export default router;