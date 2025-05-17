import { IProjectProcessor } from '../../domain/interfaces/IProjectProcessor';
import { IZipExtractor } from '../../domain/interfaces/IZipExtractor';
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { ProjectMetadata, ProjectProcessingResult } from '../../domain/models/ZipProjectModel';
import { HtmlFileProcessor } from '../../infrastructure/services/HtmlFileProcessor';
import * as path from 'path';
import * as crypto from 'crypto';
import * as fsPromises from 'fs/promises';

/**
 * Main service for processing project uploads
 * Following Dependency Inversion and Single Responsibility principles
 */
export class ProjectProcessorService implements IProjectProcessor {
  private projectsDir: string;
  
  constructor(
    private zipExtractor: IZipExtractor,
    private projectRepository: IProjectRepository,
    private htmlProcessor: HtmlFileProcessor
  ) {
    this.projectsDir = path.join(process.cwd(), "projects");
  }
  
  /**
   * Process a project upload from a ZIP file
   * @param zipFilePath Path to the uploaded ZIP file
   * @param metadata Project metadata from user input
   */
  async processProject(zipFilePath: string, metadata: ProjectMetadata): Promise<ProjectProcessingResult> {
    console.log(`Processing project upload: ${metadata.title}`);
    
    // Generate a unique project ID
    const projectId = crypto.randomBytes(8).toString("hex");
    const projectDir = path.join(this.projectsDir, projectId);
    
    try {
      // Create project directory
      await fsPromises.mkdir(projectDir, { recursive: true });
      
      // Step 1: Extract the ZIP file
      const extractionResult = await this.zipExtractor.extract(zipFilePath, projectDir);
      if (!extractionResult) {
        throw new Error("Failed to extract ZIP file");
      }
      
      // Step 2: Analyze the extracted files
      const files = await this.zipExtractor.analyzeFiles(projectDir);
      console.log(`Found ${files.htmlFiles.length} HTML files in the project`);
      
      // Step 3: Verify project has HTML files
      if (files.htmlFiles.length === 0) {
        throw new Error("ZIP file must contain at least one HTML file. Please include an HTML file in your project.");
      }
      
      // Step 4: Ensure index.html exists in the root
      const hasIndex = await this.htmlProcessor.ensureIndexHtml(projectDir, files.htmlFiles);
      if (!hasIndex) {
        throw new Error("Failed to create index.html in the project root");
      }
      
      // Step 5: Ensure all required files are accessible
      await this.htmlProcessor.ensureRequiredFiles(projectDir, files.htmlFiles);
      
      // Step 6: Generate project URLs
      const projectUrl = `/static-projects/${projectId}`;
      const previewUrl = `/static-projects/${projectId}/index.html`;
      
      // Create result object
      const result: ProjectProcessingResult = {
        projectId,
        metadata,
        projectUrl,
        previewUrl,
        files,
        success: true
      };
      
      // Step 7: Save project metadata to database
      const insertData = this.projectRepository.mapToInsertProject(result);
      await this.projectRepository.saveProject(insertData);
      
      console.log(`Project ${metadata.title} processed successfully`);
      return result;
    } catch (error) {
      console.error(`Error processing project:`, error);
      
      // Clean up on error
      try {
        await fsPromises.rm(projectDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Failed to clean up project directory:', cleanupError);
      }
      
      // Return error result
      return {
        projectId,
        metadata,
        projectUrl: '',
        previewUrl: '',
        files: { rootFiles: [], htmlFiles: [], hasIndexHtml: false },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing project'
      };
    }
  }
}