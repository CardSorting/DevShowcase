import {
  type Project,
  type InsertProject,
  type ProjectView,
  type InsertProjectView,
  type ProjectLike,
  type InsertProjectLike,
  type User,
  type UpsertUser
} from "@shared/schema";
import { Project as ProjectType } from "@shared/types";
import { DatabaseStorage } from "./databaseStorage";

/**
 * Project filters for getProjects method
 * Used in the query part of CQRS pattern
 */
export interface ProjectFilters {
  sort: string;
  categories: string[];
  popularity: string;
  search: string;
  page: number;
  visitorId: string;
}

/**
 * Storage interface following Interface Segregation Principle
 * Defines the contract for data persistence
 */
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project methods
  getProjects(filters: ProjectFilters): Promise<{
    projects: ProjectType[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    categoryCounts: { [key: string]: number };
  }>;
  getUserProjects(userId: string): Promise<ProjectType[]>;
  getProjectById(id: number, visitorId?: string): Promise<ProjectType | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // View tracking
  recordProjectView(projectId: number, visitorId: string): Promise<void>;
  
  // Like tracking
  toggleProjectLike(projectId: number, visitorId: string): Promise<{ liked: boolean }>;
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
