import { ProjectFiles, ZipExtractionOptions } from '../models/ZipProjectModel';

/**
 * Interface for ZIP extraction services
 * Following Interface Segregation and Dependency Inversion principles
 */
export interface IZipExtractor {
  /**
   * Extract a ZIP file to a target directory
   * @param zipPath Path to the ZIP file
   * @param targetPath Path where files should be extracted
   * @param options Optional extraction configuration
   */
  extract(zipPath: string, targetPath: string, options?: ZipExtractionOptions): Promise<boolean>;
  
  /**
   * Analyze extracted files to gather project structure information
   * @param projectDir Directory where files were extracted
   */
  analyzeFiles(projectDir: string): Promise<ProjectFiles>;
}