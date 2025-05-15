/**
 * Represents the metadata for a project upload
 */
export interface ProjectMetadata {
  userId: number;
  username: string;
  title: string;
  description: string;
  category: string;
}

/**
 * Represents the analyzed files in a project directory
 */
export interface ProjectFiles {
  rootFiles: string[];
  htmlFiles: string[];
  hasIndexHtml: boolean;
}

/**
 * Represents the result of processing a project
 */
export interface ProjectProcessingResult {
  projectId: string;
  metadata: ProjectMetadata;
  projectUrl: string;
  previewUrl: string;
  files: ProjectFiles;
  success: boolean;
  error?: string;
}