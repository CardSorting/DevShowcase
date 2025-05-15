import { ProjectFiles } from "../models/ZipProjectModel";

/**
 * Interface for ZIP extraction service
 * Following Interface Segregation Principle
 */
export interface IZipExtractor {
  /**
   * Extract a ZIP file to a target directory
   * @param zipFilePath Path to the ZIP file
   * @param targetDir Directory to extract to
   * @returns Boolean indicating success
   */
  extract(zipFilePath: string, targetDir: string): Promise<boolean>;

  /**
   * Analyze extracted files to identify HTML and other important files
   * @param projectDir Directory containing the extracted files
   * @returns Object with information about the project files
   */
  analyzeFiles(projectDir: string): Promise<ProjectFiles>;
}