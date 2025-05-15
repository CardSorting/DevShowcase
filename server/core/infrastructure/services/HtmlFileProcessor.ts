import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectFiles } from '../../domain/models/ZipProjectModel';

/**
 * Service for processing HTML files in projects
 * Following Single Responsibility Principle
 */
export class HtmlFileProcessor {
  /**
   * Ensures the project has an index.html file in the root directory
   * If not, it will try to find an HTML file and copy it to the root as index.html
   * @param projectDir Root directory of the project
   * @param htmlFiles List of HTML files found in the project
   */
  async ensureIndexHtml(projectDir: string, htmlFiles: string[]): Promise<boolean> {
    try {
      console.log('Ensuring index.html exists in project root');
      
      // Check if index.html already exists in the root
      const rootFiles = await fs.readdir(projectDir);
      if (rootFiles.includes('index.html')) {
        console.log('index.html already exists in project root');
        return true;
      }
      
      // If no index.html in root but we have HTML files elsewhere, use the first one
      if (htmlFiles.length > 0) {
        console.log(`No index.html in root, using ${htmlFiles[0]} as main file`);
        
        // Find an index.html file in the list, or use the first HTML file
        const indexFile = htmlFiles.find(file => path.basename(file).toLowerCase() === 'index.html') || htmlFiles[0];
        
        // Read the HTML content from the found file
        const sourcePath = path.join(projectDir, indexFile);
        const htmlContent = await fs.readFile(sourcePath, 'utf-8');
        
        // Write to root index.html
        const targetPath = path.join(projectDir, 'index.html');
        await fs.writeFile(targetPath, htmlContent);
        
        console.log(`Created index.html in project root from ${indexFile}`);
        return true;
      }
      
      console.error('No HTML files found to use as index.html');
      return false;
    } catch (error) {
      console.error('Error ensuring index.html exists:', error);
      return false;
    }
  }
  
  /**
   * Ensures all required files for the HTML files are accessible
   * Copies any necessary dependencies to ensure the project works
   * @param projectDir Root directory of the project
   * @param htmlFiles List of HTML files found in the project
   */
  async ensureRequiredFiles(projectDir: string, htmlFiles: string[]): Promise<boolean> {
    try {
      console.log('Ensuring all required files are accessible');
      
      // For each HTML file found in nested directories, check if we need to move related files
      for (const htmlFile of htmlFiles) {
        // If the HTML file is not in the root, we may need to move resources
        if (htmlFile.includes(path.sep)) {
          const htmlDir = path.dirname(path.join(projectDir, htmlFile));
          const htmlFileName = path.basename(htmlFile);
          
          // If the directory contains an HTML file that's not in the root,
          // we might need to copy/move its resources to make them accessible
          if (htmlFileName === 'index.html' && htmlDir !== projectDir) {
            console.log(`Found index.html in nested directory: ${htmlDir}`);
            
            // For simplicity in this implementation, if we find CSS or JS directories,
            // we'll ensure they're accessible from the root
            await this.checkAndCopyDirectory(htmlDir, projectDir, 'css');
            await this.checkAndCopyDirectory(htmlDir, projectDir, 'js');
            await this.checkAndCopyDirectory(htmlDir, projectDir, 'images');
            await this.checkAndCopyDirectory(htmlDir, projectDir, 'img');
            await this.checkAndCopyDirectory(htmlDir, projectDir, 'assets');
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring required files are accessible:', error);
      return false;
    }
  }
  
  /**
   * Checks if a resource directory exists and copies it if needed
   * @param sourceDir Source directory to check
   * @param targetDir Target directory to copy to
   * @param dirName Name of the directory to check/copy
   */
  private async checkAndCopyDirectory(sourceDir: string, targetDir: string, dirName: string): Promise<void> {
    try {
      const sourcePath = path.join(sourceDir, dirName);
      const targetPath = path.join(targetDir, dirName);
      
      // Check if the directory exists in the source
      try {
        const stats = await fs.stat(sourcePath);
        if (!stats.isDirectory()) return;
      } catch (e) {
        // Directory doesn't exist, nothing to copy
        return;
      }
      
      // Check if directory already exists in target
      try {
        await fs.access(targetPath);
        console.log(`Directory ${dirName} already exists in target, skipping copy`);
        return;
      } catch (e) {
        // Directory doesn't exist in target, proceed with copy
      }
      
      // Copy directory and contents
      console.log(`Copying ${dirName} directory from ${sourcePath} to ${targetPath}`);
      await this.copyDirectory(sourcePath, targetPath);
    } catch (error) {
      console.error(`Error checking/copying ${dirName} directory:`, error);
    }
  }
  
  /**
   * Recursively copy a directory and its contents
   * @param source Source directory
   * @param target Target directory
   */
  private async copyDirectory(source: string, target: string): Promise<void> {
    try {
      // Create target directory
      await fs.mkdir(target, { recursive: true });
      
      // Read all files/directories in source
      const entries = await fs.readdir(source, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(target, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively copy directories
          await this.copyDirectory(srcPath, destPath);
        } else {
          // Copy files
          await fs.copyFile(srcPath, destPath);
        }
      }
    } catch (error) {
      console.error(`Error copying directory ${source} to ${target}:`, error);
      throw error;
    }
  }
}