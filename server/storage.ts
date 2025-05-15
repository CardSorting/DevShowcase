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

// Project filters for getProjects method
interface ProjectFilters {
  sort: string;
  categories: string[];
  popularity: string;
  search: string;
  page: number;
  visitorId: string;
}

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private projectViews: Map<number, ProjectView[]>;
  private projectLikes: Map<number, ProjectLike[]>;
  private currentUserId: number;
  private currentProjectId: number;
  private currentViewId: number;
  private currentLikeId: number;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.projectViews = new Map();
    this.projectLikes = new Map();
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentViewId = 1;
    this.currentLikeId = 1;
    
    // Create an anonymous user
    this.createUser({
      username: "Anonymous",
      password: "password"
    });
    
    // Add some sample projects
    this.createSampleProjects();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Project methods
  async getProjects(filters: ProjectFilters): Promise<{
    projects: ProjectType[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    categoryCounts: { [key: string]: number };
  }> {
    const { sort, categories, popularity, search, page, visitorId } = filters;
    
    // Extract all projects as array
    let projectsArray = Array.from(this.projects.values());
    
    // Filter by categories if provided
    if (categories.length > 0) {
      projectsArray = projectsArray.filter(project => 
        categories.includes(project.category)
      );
    }
    
    // Filter by popularity
    if (popularity === "trending") {
      projectsArray = projectsArray.filter(project => project.trending);
    } else if (popularity === "popular") {
      projectsArray = projectsArray.filter(project => project.views >= 1000);
    } else if (popularity === "featured") {
      projectsArray = projectsArray.filter(project => project.featured);
    }
    
    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      projectsArray = projectsArray.filter(project => 
        project.title.toLowerCase().includes(searchLower) || 
        project.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort projects
    switch (sort) {
      case "recent":
        projectsArray.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "views":
        projectsArray.sort((a, b) => b.views - a.views);
        break;
      case "trending":
        // For trending, we'll sort by a combination of recent views and likes
        projectsArray.sort((a, b) => {
          const aScore = a.views * 0.7 + a.likes * 0.3;
          const bScore = b.views * 0.7 + b.likes * 0.3;
          return bScore - aScore;
        });
        break;
      case "popular":
      default:
        // Popular is the default sort - by likes
        projectsArray.sort((a, b) => b.likes - a.likes);
    }
    
    // Calculate total and category counts
    const totalCount = projectsArray.length;
    
    const categoryCounts: { [key: string]: number } = {};
    Array.from(this.projects.values()).forEach(project => {
      if (!categoryCounts[project.category]) {
        categoryCounts[project.category] = 0;
      }
      categoryCounts[project.category]++;
    });
    
    // Pagination
    const pageSize = 8;
    const totalPages = Math.ceil(totalCount / pageSize);
    const safePageNumber = Math.max(1, Math.min(page, totalPages || 1));
    const start = (safePageNumber - 1) * pageSize;
    const end = start + pageSize;
    const paginatedProjects = projectsArray.slice(start, end);
    
    // Convert to ProjectType with username and isLiked status
    const enrichedProjects: ProjectType[] = paginatedProjects.map(project => {
      const user = this.users.get(project.userId || 1);
      const isLiked = this.isProjectLikedByVisitor(project.id, visitorId);
      
      return {
        ...project,
        username: user?.username || "Anonymous",
        isLiked,
      };
    });
    
    return {
      projects: enrichedProjects,
      totalCount,
      totalPages,
      currentPage: safePageNumber,
      categoryCounts,
    };
  }
  
  async getProjectById(id: number, visitorId?: string): Promise<ProjectType | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const user = this.users.get(project.userId || 1);
    const isLiked = visitorId ? this.isProjectLikedByVisitor(id, visitorId) : false;
    
    return {
      ...project,
      username: user?.username || "Anonymous",
      isLiked,
    };
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const now = new Date();
    
    const project: Project = {
      ...insertProject,
      id,
      views: 0,
      likes: 0,
      featured: false,
      trending: false,
      createdAt: now,
      updatedAt: now,
    };
    
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, data: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = {
      ...project,
      ...data,
      updatedAt: new Date(),
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    const exists = this.projects.has(id);
    if (!exists) return false;
    
    this.projects.delete(id);
    return true;
  }
  
  // View tracking
  async recordProjectView(projectId: number, visitorId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if this visitor has already viewed the project
    const views = this.projectViews.get(projectId) || [];
    const hasViewed = views.some(view => view.visitorId === visitorId);
    
    if (!hasViewed) {
      // Add view record
      const view: ProjectView = {
        id: this.currentViewId++,
        projectId,
        visitorId,
        viewedAt: new Date(),
      };
      
      views.push(view);
      this.projectViews.set(projectId, views);
      
      // Increment view count
      project.views += 1;
      
      // Check if trending (simplified logic)
      if (project.views > 100 && project.likes > 10) {
        project.trending = true;
      }
      
      this.projects.set(projectId, project);
    }
  }
  
  // Like tracking
  async toggleProjectLike(projectId: number, visitorId: string): Promise<{ liked: boolean }> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Get existing likes
    const likes = this.projectLikes.get(projectId) || [];
    const existingLikeIndex = likes.findIndex(like => like.visitorId === visitorId);
    
    if (existingLikeIndex !== -1) {
      // Unlike: remove the like
      likes.splice(existingLikeIndex, 1);
      project.likes -= 1;
      this.projects.set(projectId, project);
      this.projectLikes.set(projectId, likes);
      return { liked: false };
    } else {
      // Like: add a new like
      const like: ProjectLike = {
        id: this.currentLikeId++,
        projectId,
        userId: null,
        visitorId,
        likedAt: new Date(),
      };
      
      likes.push(like);
      project.likes += 1;
      this.projects.set(projectId, project);
      this.projectLikes.set(projectId, likes);
      return { liked: true };
    }
  }
  
  // Helper to check if a visitor has liked a project
  private isProjectLikedByVisitor(projectId: number, visitorId: string): boolean {
    const likes = this.projectLikes.get(projectId) || [];
    return likes.some(like => like.visitorId === visitorId);
  }
  
  // Helper to create sample projects for initial state
  private createSampleProjects(): void {
    const projects: InsertProject[] = [
      {
        userId: 1,
        title: "Analytics Dashboard",
        description: "A responsive analytics dashboard with interactive charts and dark/light mode toggle.",
        category: "web-app",
        projectUrl: "#",
        previewUrl: "#",
        thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        zipPath: "/tmp/analytics.zip",
      },
      {
        userId: 1,
        title: "MinimalShop",
        description: "Sleek e-commerce platform with product filtering, cart functionality, and checkout system.",
        category: "ecommerce",
        projectUrl: "#",
        previewUrl: "#",
        thumbnailUrl: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        zipPath: "/tmp/minimalshop.zip",
      },
      {
        userId: 1,
        title: "Pixel Runner",
        description: "HTML5 canvas-based endless runner game with score tracking and power-ups.",
        category: "game",
        projectUrl: "#",
        previewUrl: "#",
        thumbnailUrl: "https://pixabay.com/get/g8b8e70b5f11973bd3d350f56979aba78c2c81f953ce21fdf5832777ff3fc6bcc64d212c7a4a39eee8aaba59b6b0e8c1f6fe37e147412fe280bc62db249b209ae_1280.jpg",
        zipPath: "/tmp/pixelrunner.zip",
      },
      {
        userId: 1,
        title: "Creative Folio",
        description: "Portfolio website with smooth scrolling, project showcases, and contact form integration.",
        category: "portfolio",
        projectUrl: "#",
        previewUrl: "#",
        thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        zipPath: "/tmp/creativefolio.zip",
      },
      {
        userId: 1,
        title: "LaunchPad SaaS",
        description: "Modern SaaS landing page with animations, testimonials slider, and pricing tables.",
        category: "landing-page",
        projectUrl: "#",
        previewUrl: "#",
        thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        zipPath: "/tmp/launchpad.zip",
      },
      {
        userId: 1,
        title: "CodeCollab",
        description: "Real-time collaborative code editor with syntax highlighting and live preview.",
        category: "web-app",
        projectUrl: "#",
        previewUrl: "#",
        thumbnailUrl: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        zipPath: "/tmp/codecollab.zip",
      }
    ];
    
    // Add the projects with random views and likes
    projects.forEach(project => {
      const id = this.currentProjectId++;
      const now = new Date();
      
      // Create random stats 
      const views = Math.floor(Math.random() * 5000);
      const likes = Math.floor(Math.random() * 500);
      const featured = Math.random() > 0.7;
      const trending = views > 1000 && likes > 100;
      
      // Create the project
      const newProject: Project = {
        ...project,
        id,
        views,
        likes,
        featured,
        trending,
        createdAt: now,
        updatedAt: now,
      };
      
      this.projects.set(id, newProject);
    });
  }
}

export const storage = new MemStorage();
