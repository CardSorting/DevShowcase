import { IZipExtractor } from '../../domain/interfaces/IZipExtractor';
import { FileEntity, ProjectFiles, ZipExtractionOptions } from '../../domain/models/ZipProjectModel';
import * as path from 'path';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import extract from 'extract-zip';

/**
 * Concrete implementation of ZIP extraction service
 * Following Single Responsibility Principle
 */
export class ExtractZipService implements IZipExtractor {
  /**
   * Extract a ZIP file to a target directory
   * @param zipPath Path to the ZIP file
   * @param targetPath Path where files should be extracted
   * @param options Optional extraction configuration
   */
  async extract(zipPath: string, targetPath: string, options?: ZipExtractionOptions): Promise<boolean> {
    try {
      console.log(`Extracting ZIP: ${zipPath} to ${targetPath}`);
      
      // Ensure the target directory exists
      await fsPromises.mkdir(targetPath, { recursive: true });
      
      // Use extract-zip to extract the ZIP file
      await extract(zipPath, { dir: targetPath });
      
      console.log(`ZIP extraction completed successfully`);
      return true;
    } catch (error) {
      console.error('Error extracting ZIP file:', error);
      return false;
    }
  }
  
  /**
   * Analyze extracted files to gather project structure information
   * @param projectDir Directory where files were extracted
   */
  async analyzeFiles(projectDir: string): Promise<ProjectFiles> {
    console.log(`Analyzing files in directory: ${projectDir}`);
    
    const result: ProjectFiles = {
      rootFiles: [],
      htmlFiles: [],
      hasIndexHtml: false
    };
    
    try {
      // Get all files in the project directory recursively
      const files = await this.getFilesRecursively(projectDir);
      
      // Process files
      for (const file of files) {
        // Add to rootFiles if it's in the root directory
        if (path.dirname(file.path) === projectDir) {
          result.rootFiles.push(file);
        }
        
        // Add to htmlFiles if it's an HTML file
        if (file.name.endsWith('.html')) {
          result.htmlFiles.push(file);
          
          // Check if it's index.html
          if (file.name === 'index.html') {
            // Check if the index.html is in the root or a subfolder
            if (path.dirname(file.path) === projectDir) {
              result.hasIndexHtml = true;
            }
          }
        }
      }
      
      console.log(`Analysis results: 
        - Total root files: ${result.rootFiles.length}
        - Total HTML files: ${result.htmlFiles.length}
        - Has index.html in root: ${result.hasIndexHtml}`);
      
      return result;
    } catch (error) {
      console.error('Error analyzing project files:', error);
      return result;
    }
  }
  
  /**
   * Get all files in a directory recursively
   * @param dir Directory to scan
   * @param baseDir Base directory for relative paths (defaults to dir)
   */
  private async getFilesRecursively(dir: string, baseDir?: string): Promise<FileEntity[]> {
    if (!baseDir) baseDir = dir;
    
    let results: FileEntity[] = [];
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      
      if (entry.isDirectory()) {
        // Add directory entity
        results.push({
          path: fullPath,
          name: entry.name,
          type: 'directory'
        });
        
        // Recursively get files in subdirectory
        const subFiles = await this.getFilesRecursively(fullPath, baseDir);
        results = results.concat(subFiles);
      } else {
        // Add file entity
        results.push({
          path: fullPath,
          name: entry.name,
          type: 'file'
        });
      }
    }
    
    return results;
  }
}