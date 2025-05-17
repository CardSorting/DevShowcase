import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Utility class for performing integrity checks on project directories
 * Ensures project directories exist and contain required files
 */
export class ProjectIntegrityCheck {
  /**
   * Verify that a project directory exists and has proper structure
   * @param projectId The project ID to check
   * @returns True if project exists and is valid, false otherwise
   */
  static async verifyProjectExists(projectId: string): Promise<boolean> {
    const projectDir = path.join(process.cwd(), "projects", projectId);
    
    try {
      // Check if directory exists
      await fs.access(projectDir, fs.constants.F_OK);
      
      // Check if there's at least one HTML file
      const hasHtmlFile = await this.hasHtmlFile(projectDir);
      
      return hasHtmlFile;
    } catch (error) {
      // Project directory doesn't exist
      console.error(`Project directory check failed for ${projectId}:`, error);
      return false;
    }
  }
  
  /**
   * Check if directory has at least one HTML file
   * @param directory The directory to check
   * @returns True if at least one HTML file exists
   */
  private static async hasHtmlFile(directory: string): Promise<boolean> {
    try {
      const files = await fs.readdir(directory, { withFileTypes: true });
      
      // Check if any HTML files in current directory
      if (files.some(file => file.isFile() && file.name.endsWith('.html'))) {
        return true;
      }
      
      // Check subdirectories recursively
      for (const file of files) {
        if (file.isDirectory()) {
          const innerHasHtml = await this.hasHtmlFile(path.join(directory, file.name));
          if (innerHasHtml) {
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error checking for HTML files in ${directory}:`, error);
      return false;
    }
  }
  
  /**
   * Gets a list of all valid project IDs in the projects directory
   * @returns Array of valid project IDs
   */
  static async getValidProjectIds(): Promise<string[]> {
    const projectsDir = path.join(process.cwd(), "projects");
    
    try {
      const entries = await fs.readdir(projectsDir, { withFileTypes: true });
      const projectDirs = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
      
      // Verify each project directory is valid
      const validProjects = [];
      for (const dir of projectDirs) {
        const isValid = await this.verifyProjectExists(dir);
        if (isValid) {
          validProjects.push(dir);
        }
      }
      
      return validProjects;
    } catch (error) {
      console.error('Error listing project directories:', error);
      return [];
    }
  }
}