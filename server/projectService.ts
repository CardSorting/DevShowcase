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
      
      // Check for index.html
      const hasIndex = await this.checkForIndexFile(projectDir);
      if (!hasIndex) {
        throw new Error("ZIP file must contain an index.html file in the root or a single directory");
      }
      
      // Create thumbnail (in a real app, this would generate a screenshot)
      // For this demo, we'll just use a placeholder
      
      // Return project metadata
      const projectUrl = `/projects/${projectId}`;
      const previewUrl = `/projects/${projectId}/index.html`;
      
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
    return new Promise((resolve, reject) => {
      try {
        const extractStream = unzip.Extract({ path: targetPath });
        
        extractStream.on('error', reject);
        extractStream.on('close', resolve);
        
        fs.createReadStream(zipPath)
          .pipe(extractStream);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Check if the extracted project has an index.html file
   */
  private async checkForIndexFile(projectDir: string): Promise<boolean> {
    // Check for index.html in root
    try {
      const stats = await fsPromises.stat(path.join(projectDir, 'index.html'));
      if (stats.isFile()) {
        return true;
      }
    } catch (error) {
      // File doesn't exist, continue checking
    }
    
    // If no index.html in root, look for directories
    const entries = await fsPromises.readdir(projectDir, { withFileTypes: true });
    const dirs = entries.filter(entry => entry.isDirectory());
    
    // If there's only one directory, check if it has an index.html
    if (dirs.length === 1) {
      try {
        const stats = await fsPromises.stat(path.join(projectDir, dirs[0].name, 'index.html'));
        if (stats.isFile()) {
          // Move all files from this directory to root
          const innerDir = path.join(projectDir, dirs[0].name);
          const innerFiles = await fsPromises.readdir(innerDir);
          
          for (const file of innerFiles) {
            const source = path.join(innerDir, file);
            const target = path.join(projectDir, file);
            await fsPromises.rename(source, target);
          }
          
          // Remove the now-empty directory
          await fsPromises.rmdir(innerDir);
          return true;
        }
      } catch (error) {
        // File doesn't exist
      }
    }
    
    // No index.html found
    return false;
  }
}

export const projectService = new ProjectService();