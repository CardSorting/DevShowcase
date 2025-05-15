/**
 * Domain models for handling ZIP project uploads
 * Following Domain-Driven Design (DDD) principles
 */

export interface ProjectMetadata {
  userId: number;
  username: string;
  title: string;
  description: string;
  category: string;
}

export interface FileEntity {
  path: string;
  name: string;
  type: 'file' | 'directory';
  content?: Buffer;
}

export interface ProjectFiles {
  rootFiles: FileEntity[];
  htmlFiles: FileEntity[];
  hasIndexHtml: boolean;
}

export interface ProjectProcessingResult {
  projectId: string; 
  metadata: ProjectMetadata;
  projectUrl: string;
  previewUrl: string;
  files: ProjectFiles;
  success: boolean;
  error?: string;
}

export interface ZipExtractionOptions {
  preserveStructure?: boolean;
  overwriteExisting?: boolean;
}

// Value Objects
export type ProjectId = string;
export type FilePath = string;