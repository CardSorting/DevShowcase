import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import { ProjectIntegrityCheck } from './ProjectIntegrityCheck';

/**
 * Middleware to verify project existence and redirect to static files
 */
export const projectVerificationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract project ID from URL
    // Example: /project/view/487ba522fd108869 -> 487ba522fd108869
    const parts = req.path.split('/');
    if (parts.length < 3) {
      return next();
    }
    
    const projectId = parts[2]; // Index 2 for routes like /project/view/ID
    
    // Verify that the project exists
    const exists = await ProjectIntegrityCheck.verifyProjectExists(projectId);
    
    if (!exists) {
      // If the project doesn't exist, redirect to the 404 page
      return res.status(404).send('Project not found');
    }
    
    // If the project exists, construct the static content URL
    const staticPath = path.join('/static-content/projects', projectId);
    
    // If we're trying to view the project, add index.html
    if (req.path.startsWith('/project/view/')) {
      return res.redirect(`${staticPath}/index.html`);
    }
    
    // For project directory browsing or other access
    return res.redirect(staticPath);
  } catch (error) {
    console.error('Error in project verification middleware:', error);
    next(error);
  }
};