import { Router } from 'express';
import { UserProjectsController } from '../presentation/UserProjectsController';

// Initialize router
const router = Router();
const controller = new UserProjectsController();

// Get all projects with analytics for a user
router.get('/user/:userId/projects', (req, res) => controller.getUserProjects(req, res));

// Get single project with analytics for a user
router.get('/user/:userId/projects/:projectId', (req, res) => controller.getProjectWithAnalytics(req, res));

// Get detailed analytics for a specific project
router.get('/user/:userId/projects/:projectId/analytics', (req, res) => controller.getProjectAnalytics(req, res));

// Get engagement metrics for a specific project
router.get('/user/:userId/projects/:projectId/engagement', (req, res) => controller.getProjectEngagement(req, res));

export default router;