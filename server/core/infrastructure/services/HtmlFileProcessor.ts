import * as path from 'path';
import * as fsPromises from 'fs/promises';
import { FileEntity } from '../../domain/models/ZipProjectModel';

/**
 * Service responsible for HTML file handling
 * Follows Single Responsibility Principle
 */
export class HtmlFileProcessor {
  /**
   * Ensure project has an index.html in the root directory
   * @param projectDir The project root directory
   * @param htmlFiles List of HTML files found in the project
   */
  async ensureIndexHtml(projectDir: string, htmlFiles: FileEntity[]): Promise<boolean> {
    console.log(`Ensuring index.html exists in ${projectDir}`);
    
    // Check if index.html already exists in the root
    const rootIndexPath = path.join(projectDir, 'index.html');
    try {
      await fsPromises.access(rootIndexPath);
      console.log('index.html already exists in the root directory');
      return true;
    } catch (error) {
      // File doesn't exist, continue
    }
    
    // If we have any HTML files, use the first one as index.html
    if (htmlFiles.length > 0) {
      const sourceFile = htmlFiles[0].path;
      console.log(`Using ${sourceFile} as index.html`);
      
      try {
        await fsPromises.copyFile(sourceFile, rootIndexPath);
        console.log(`Created index.html in the root directory`);
        return true;
      } catch (error) {
        console.error('Error copying HTML file to root:', error);
        return false;
      }
    } else {
      console.log('No HTML files found in the project');
      return false;
    }
  }
  
  /**
   * Ensure all files required by HTML files are accessible from the root
   * @param projectDir The project root directory
   * @param htmlFiles List of HTML files
   */
  async ensureRequiredFiles(projectDir: string, htmlFiles: FileEntity[]): Promise<void> {
    console.log(`Ensuring required files are accessible from the root`);
    
    for (const htmlFile of htmlFiles) {
      const htmlDir = path.dirname(htmlFile.path);
      
      // If the HTML file is not in the root, we might need to copy assets
      if (htmlDir !== projectDir) {
        console.log(`Processing dependencies for HTML file in ${htmlDir}`);
        
        // Here we would analyze the HTML content for dependencies
        // (CSS, JS, images, etc.) and ensure they're accessible
        // from the root directory structure
        
        // For simple implementation, we'll just copy the entire directory structure
        await this.copyDirectoryStructure(htmlDir, projectDir);
      }
    }
  }
  
  /**
   * Copy directory structure to ensure files are accessible
   * @param sourceDir Source directory
   * @param targetDir Target directory
   */
  private async copyDirectoryStructure(sourceDir: string, targetDir: string): Promise<void> {
    try {
      const entries = await fsPromises.readdir(sourceDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const sourcePath = path.join(sourceDir, entry.name);
        const targetPath = path.join(targetDir, entry.name);
        
        // Skip if the file/dir is index.html (already handled)
        if (entry.name === 'index.html') continue;
        
        try {
          // Check if target already exists
          await fsPromises.access(targetPath);
          // Skip if it exists
          continue;
        } catch (error) {
          // Target doesn't exist, proceed with copy
        }
        
        if (entry.isDirectory()) {
          // Create directory and recursively copy contents
          await fsPromises.mkdir(targetPath, { recursive: true });
          await this.copyDirectoryStructure(sourcePath, targetPath);
        } else {
          // Copy file
          await fsPromises.copyFile(sourcePath, targetPath);
        }
      }
    } catch (error) {
      console.error(`Error copying directory structure:`, error);
    }
  }
}