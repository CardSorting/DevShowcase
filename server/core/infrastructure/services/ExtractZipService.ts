import { IZipExtractor } from '../../domain/interfaces/IZipExtractor';
import { ProjectFiles } from '../../domain/models/ZipProjectModel';
import * as extract from 'extract-zip';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Implementation of ZIP extraction service
 * Using the more reliable extract-zip package for better extraction results
 */
export class ExtractZipService implements IZipExtractor {
  /**
   * Extract a ZIP file to a target directory
   * @param zipFilePath Path to the ZIP file
   * @param targetDir Directory to extract to
   */
  async extract(zipFilePath: string, targetDir: string): Promise<boolean> {
    try {
      console.log(`Extracting ZIP from ${zipFilePath} to ${targetDir}`);
      
      // Ensure target directory exists
      await fs.mkdir(targetDir, { recursive: true });
      
      // Extract the ZIP file
      await extract(zipFilePath, { dir: path.resolve(targetDir) });
      
      // Verify extraction by checking if directory has content
      const files = await fs.readdir(targetDir);
      console.log(`Found ${files.length} items in extracted directory`);
      
      return files.length > 0;
    } catch (error) {
      console.error('Error extracting ZIP file:', error);
      return false;
    }
  }
  
  /**
   * Analyze extracted files to identify HTML and other important files
   * @param projectDir Directory containing the extracted files
   */
  async analyzeFiles(projectDir: string): Promise<ProjectFiles> {
    try {
      console.log(`Analyzing files in ${projectDir}`);
      
      const rootFiles = await fs.readdir(projectDir);
      console.log(`Root files: ${rootFiles.join(', ')}`);
      
      // First, check for index.html in the root directory
      const rootIndexHtml = rootFiles.includes('index.html');
      
      // Find all HTML files recursively
      const htmlFiles = await this.findHtmlFilesRecursively(projectDir);
      console.log(`Found ${htmlFiles.length} HTML files`);
      
      return {
        rootFiles,
        htmlFiles,
        hasIndexHtml: rootIndexHtml || htmlFiles.some(file => path.basename(file) === 'index.html')
      };
    } catch (error) {
      console.error('Error analyzing project files:', error);
      return {
        rootFiles: [],
        htmlFiles: [],
        hasIndexHtml: false
      };
    }
  }
  
  /**
   * Recursively find all HTML files in a directory
   * @param dir Directory to search
   * @param basePath Optional base path for constructing relative paths
   */
  private async findHtmlFilesRecursively(dir: string, basePath = ''): Promise<string[]> {
    let htmlFiles: string[] = [];
    
    try {
      const files = await fs.readdir(dir, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        const relativePath = path.join(basePath, file.name);
        
        if (file.isDirectory()) {
          // Skip macOS metadata directories
          if (file.name === '__MACOSX') {
            console.log('Skipping macOS metadata directory');
            continue;
          }
          
          // Recursively search subdirectories
          const subDirHtmlFiles = await this.findHtmlFilesRecursively(filePath, relativePath);
          htmlFiles = [...htmlFiles, ...subDirHtmlFiles];
        } else if (file.isFile() && file.name.toLowerCase().endsWith('.html')) {
          htmlFiles.push(relativePath);
        }
      }
    } catch (error) {
      console.error(`Error searching for HTML files in ${dir}:`, error);
    }
    
    return htmlFiles;
  }
}