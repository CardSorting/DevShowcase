import fs from "fs";
import * as fsPromises from "fs/promises";
import path from "path";
import unzip from "node-unzip-2";
import { promisify } from "util";
import { pipeline as streamPipeline } from "stream";
import { InsertProject } from "@shared/schema";
import * as crypto from "crypto";

// Add type declarations
declare module 'node-unzip-2';
declare module 'multer';

// Helper to convert pipeline to promise
const pipeline = promisify(streamPipeline);

interface UploadMetadata {
  title: string;
  description: string;
  category: string;
  userId: number;
  username: string;
}

class ProjectService {
  private projectsDir: string;
  
  constructor() {
    this.projectsDir = path.join(process.cwd(), "projects");
  }
  
  /**
   * Process a ZIP file upload, extract it, and return project metadata
   */
  async processUpload(file: any, metadata: UploadMetadata): Promise<InsertProject> {
    // Create a unique directory for this project
    const projectId = crypto.randomBytes(8).toString("hex");
    const projectDir = path.join(this.projectsDir, projectId);
    await fsPromises.mkdir(projectDir, { recursive: true });
    
    try {
      // Extract the ZIP file
      await this.extractZip(file.path, projectDir);
      
      // Check for HTML files to use as index
      const hasIndex = await this.checkForIndexFile(projectDir);
      if (!hasIndex) {
        throw new Error("ZIP file must contain at least one HTML file. Please include an HTML file in your project.");
      }
      
      // Create thumbnail (in a real app, this would generate a screenshot)
      // For this demo, we'll just use a placeholder
      
      // Return project metadata
      const projectUrl = `/static-content/projects/${projectId}`;
      const previewUrl = `/static-content/projects/${projectId}/index.html`;
      
      return {
        userId: metadata.userId,
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        projectUrl: projectUrl,
        previewUrl: previewUrl,
        thumbnailUrl: null, // Would be a proper thumbnail in production
        zipPath: file.path,
      };
    } catch (error) {
      // Clean up on error
      await fsPromises.rm(projectDir, { recursive: true, force: true })
        .catch(() => console.error('Failed to clean up project directory'));
      throw error;
    }
  }
  
  /**
   * Extract a ZIP file to a target directory
   */
  private async extractZip(zipPath: string, targetPath: string): Promise<void> {
    console.log(`Extracting ZIP: ${zipPath} to ${targetPath}`);
    return new Promise((resolve, reject) => {
      try {
        const extractStream = unzip.Extract({ path: targetPath });
        
        extractStream.on('error', (err) => {
          console.error('ZIP extraction error:', err);
          reject(err);
        });
        extractStream.on('close', () => {
          console.log('ZIP extraction completed successfully');
          resolve();
        });
        
        const readStream = fs.createReadStream(zipPath);
        readStream.on('error', (err) => {
          console.error('Error reading ZIP file:', err);
          reject(err);
        });
        
        readStream.pipe(extractStream);
      } catch (error) {
        console.error('Exception during ZIP extraction setup:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Check if the extracted project has an index.html file
   * With enhanced search to find HTML files at any depth
   */
  private async checkForIndexFile(projectDir: string): Promise<boolean> {
    console.log(`Checking for index.html in project directory: ${projectDir}`);
    
    // Log contents of the project directory
    try {
      const dirContents = await fsPromises.readdir(projectDir);
      console.log(`Project directory contents: ${JSON.stringify(dirContents)}`);
    } catch (err) {
      console.error(`Error reading project directory: ${err}`);
    }
    
    // First, check for index.html in root
    try {
      const indexPath = path.join(projectDir, 'index.html');
      console.log(`Checking for index.html at: ${indexPath}`);
      const stats = await fsPromises.stat(indexPath);
      if (stats.isFile()) {
        console.log('Found index.html in root directory');
        return true;
      }
    } catch (error) {
      // File doesn't exist, continue checking
      console.log('No index.html found in root directory, continuing search');
    }
    
    // If no index.html in root, look for directories
    const entries = await fsPromises.readdir(projectDir, { withFileTypes: true });
    const dirs = entries.filter(entry => entry.isDirectory());
    console.log(`Found ${dirs.length} subdirectories: ${dirs.map(d => d.name).join(', ')}`);
    
    // If there's only one directory, check if it has an index.html
    if (dirs.length === 1) {
      try {
        const innerDir = path.join(projectDir, dirs[0].name);
        console.log(`Checking single subdirectory: ${innerDir}`);
        const innerFileFound = await this.findAndMoveIndexFile(innerDir, projectDir);
        if (innerFileFound) {
          console.log('Found and moved index.html from subdirectory');
          return true;
        }
      } catch (error) {
        console.error("Error checking inner directory:", error);
      }
    }
    
    // If still no index.html, check for any HTML file at the root
    try {
      const rootFiles = await fsPromises.readdir(projectDir);
      const htmlFiles = rootFiles.filter(file => file.endsWith('.html'));
      console.log(`Found ${htmlFiles.length} HTML files in root: ${htmlFiles.join(', ')}`);
      
      if (htmlFiles.length > 0) {
        // If there's any HTML file, rename the first one to index.html
        const sourceFile = path.join(projectDir, htmlFiles[0]);
        const targetFile = path.join(projectDir, 'index.html');
        console.log(`Using ${htmlFiles[0]} as index.html`);
        
        if (htmlFiles[0] !== 'index.html') {
          await fsPromises.copyFile(sourceFile, targetFile);
          console.log(`Copied ${sourceFile} to ${targetFile}`);
        }
        
        return true;
      }
    } catch (error) {
      console.error("Error checking root for HTML files:", error);
    }

    // Search recursively for any HTML file in subdirectories
    console.log('Performing recursive search for HTML files in all subdirectories');
    try {
      const result = await this.findHtmlFileRecursively(projectDir, projectDir);
      console.log(`Recursive search result: ${result ? 'HTML file found' : 'No HTML files found'}`);
      return result;
    } catch (error) {
      console.error("Error in recursive search:", error);
      return false;
    }
  }
  
  /**
   * Recursively search for HTML files in the project directory
   */
  private async findHtmlFileRecursively(currentDir: string, projectRoot: string): Promise<boolean> {
    console.log(`Recursively searching for HTML files in: ${currentDir}`);
    const entries = await fsPromises.readdir(currentDir, { withFileTypes: true });
    console.log(`Directory ${currentDir} contains ${entries.length} entries`);
    
    // First, check for any HTML files
    const htmlFiles = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
      .map(entry => entry.name);
    
    console.log(`Found ${htmlFiles.length} HTML files in ${currentDir}: ${htmlFiles.join(', ')}`);
    
    if (htmlFiles.length > 0) {
      // Create an index.html at the project root
      const sourceFile = path.join(currentDir, htmlFiles[0]);
      const targetFile = path.join(projectRoot, 'index.html');
      
      console.log(`Using ${sourceFile} as source for index.html`);
      
      // If the HTML file is not at the root, copy it to the root as index.html
      if (currentDir !== projectRoot || htmlFiles[0] !== 'index.html') {
        console.log(`Copying ${sourceFile} to ${targetFile}`);
        await fsPromises.copyFile(sourceFile, targetFile);
      }
      
      // If the HTML is in a subdirectory, copy all associated files to maintain relative paths
      if (currentDir !== projectRoot) {
        const relativeDir = path.relative(projectRoot, currentDir);
        const parentDir = path.dirname(relativeDir);
        
        console.log(`HTML file is in subdirectory, relative path: ${relativeDir}, parent dir: ${parentDir}`);
        
        // Ensure the parent directory exists at the root
        if (parentDir !== '.') {
          const newDir = path.join(projectRoot, parentDir);
          console.log(`Creating directory: ${newDir}`);
          await fsPromises.mkdir(newDir, { recursive: true });
        }
      }
      
      console.log('Successfully found and processed HTML file');
      return true;
    }
    
    // Recursively check subdirectories
    const directories = entries.filter(entry => entry.isDirectory());
    console.log(`Found ${directories.length} subdirectories to check: ${directories.map(d => d.name).join(', ')}`);
    
    for (const entry of directories) {
      console.log(`Checking subdirectory: ${entry.name}`);
      const found = await this.findHtmlFileRecursively(
        path.join(currentDir, entry.name),
        projectRoot
      );
      
      if (found) {
        console.log(`Found HTML file in subdirectory: ${entry.name}`);
        return true;
      }
    }
    
    console.log(`No HTML files found in ${currentDir} or its subdirectories`);
    return false;
  }
  
  /**
   * Find index.html in a directory and move it to target with all related files
   */
  private async findAndMoveIndexFile(sourceDir: string, targetDir: string): Promise<boolean> {
    console.log(`Looking for index.html in ${sourceDir} to move to ${targetDir}`);
    try {
      // Check if the directory has an index.html
      const indexPath = path.join(sourceDir, 'index.html');
      console.log(`Checking for index.html at: ${indexPath}`);
      try {
        const stats = await fsPromises.stat(indexPath);
        if (stats.isFile()) {
          console.log(`Found index.html in ${sourceDir}`);
          // Move all files from this directory to root
          const innerFiles = await fsPromises.readdir(sourceDir);
          console.log(`Directory contains ${innerFiles.length} files to process`);
          
          for (const file of innerFiles) {
            const source = path.join(sourceDir, file);
            const target = path.join(targetDir, file);
            console.log(`Processing file: ${file} (${source} -> ${target})`);
            
            // Skip if file already exists
            try {
              await fsPromises.access(target);
              console.log(`File ${target} already exists, skipping`);
              continue;
            } catch (error) {
              // Target doesn't exist, proceed with copy
              console.log(`Target ${target} doesn't exist, proceeding with copy`);
            }
            
            // Handle both files and directories
            const stats = await fsPromises.stat(source);
            if (stats.isDirectory()) {
              console.log(`${source} is a directory, creating ${target}`);
              await fsPromises.mkdir(target, { recursive: true });
              // Copy directory contents recursively
              await this.copyDirectory(source, target);
            } else {
              console.log(`Copying file ${source} to ${target}`);
              await fsPromises.copyFile(source, target);
            }
          }
          
          console.log(`Successfully moved all files from ${sourceDir} to ${targetDir}`);
          return true;
        }
      } catch (error) {
        // Index.html doesn't exist at this level
        console.log(`No index.html found at ${indexPath}: ${error}`);
      }
      
      // Recursively check subdirectories
      const entries = await fsPromises.readdir(sourceDir, { withFileTypes: true });
      const dirs = entries.filter(entry => entry.isDirectory());
      console.log(`Found ${dirs.length} subdirectories in ${sourceDir}: ${dirs.map(d => d.name).join(', ')}`);
      
      for (const dir of dirs) {
        console.log(`Recursively checking subdirectory: ${dir.name}`);
        const found = await this.findAndMoveIndexFile(
          path.join(sourceDir, dir.name),
          targetDir
        );
        if (found) {
          console.log(`Found index.html in subdirectory: ${dir.name}`);
          return true;
        }
      }
      
      console.log(`No index.html found in ${sourceDir} or its subdirectories`);
      return false;
    } catch (error) {
      console.error("Error in findAndMoveIndexFile:", error);
      return false;
    }
  }
  
  /**
   * Recursively copy a directory and its contents
   */
  private async copyDirectory(source: string, target: string): Promise<void> {
    const entries = await fsPromises.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(target, entry.name);
      
      if (entry.isDirectory()) {
        await fsPromises.mkdir(destPath, { recursive: true });
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fsPromises.copyFile(srcPath, destPath);
      }
    }
  }
}

export const projectService = new ProjectService();