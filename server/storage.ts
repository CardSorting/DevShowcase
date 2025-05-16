import {
  type Project,
  type InsertProject,
  type ProjectView,
  type InsertProjectView,
  type ProjectLike,
  type InsertProjectLike,
  type User,
  type InsertUser
} from "@shared/schema";
import { Project as ProjectType } from "@shared/types";
import { DatabaseStorage } from "./databaseStorage";

// Project filters for getProjects method
export interface ProjectFilters {
  sort: string;
  categories: string[];
  popularity: string;
  search: string;
  page: number;
  visitorId: string;
  userId?: number; // Optional filter by user ID
}

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProjects(filters: ProjectFilters): Promise<{
    projects: ProjectType[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    categoryCounts: { [key: string]: number };
  }>;
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
