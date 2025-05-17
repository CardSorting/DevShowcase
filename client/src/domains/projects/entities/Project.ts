/**
 * Project Entity - Core Domain Model
 * Represents a project in our domain with all its properties and behavior
 * Following Domain-Driven Design principles
 */
export interface ProjectAttributes {
  id: number;
  userId?: number;
  username: string;
  title: string;
  description: string;
  category: string;
  projectUrl: string;
  previewUrl: string;
  thumbnailUrl?: string;
  views: number;
  likes: number;
  featured: boolean;
  trending: boolean;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
}

// Value objects for Project domain
export type ProjectCategory = 
  | "JavaScript" 
  | "Web App" 
  | "React" 
  | "UI/UX" 
  | "Game" 
  | "Portfolio" 
  | "Library" 
  | "API" 
  | "Mobile" 
  | "AI" 
  | string;

export type ProjectStatus = "new" | "trending" | "featured" | "regular";

/**
 * Project Entity
 * Encapsulates all project-related domain logic following DDD principles
 */
export class Project {
  private attributes: ProjectAttributes;

  constructor(attrs: ProjectAttributes) {
    this.validateAttributes(attrs);
    this.attributes = attrs;
  }

  // Data validation on construction - ensures domain integrity
  private validateAttributes(attrs: ProjectAttributes): void {
    if (!attrs.title) {
      throw new Error("Project must have a title");
    }
    
    if (!attrs.description) {
      throw new Error("Project must have a description");
    }
    
    if (!attrs.projectUrl) {
      throw new Error("Project must have a project URL");
    }
  }

  // Getters for all properties
  get id(): number { return this.attributes.id; }
  get userId(): number | undefined { return this.attributes.userId; }
  get username(): string { return this.attributes.username; }
  get title(): string { return this.attributes.title; }
  get description(): string { return this.attributes.description; }
  get category(): ProjectCategory { return this.attributes.category as ProjectCategory; }
  get projectUrl(): string { return this.attributes.projectUrl; }
  get previewUrl(): string { return this.attributes.previewUrl; }
  get thumbnailUrl(): string | undefined { return this.attributes.thumbnailUrl; }
  get views(): number { return this.attributes.views; }
  get likes(): number { return this.attributes.likes; }
  get featured(): boolean { return this.attributes.featured; }
  get trending(): boolean { return this.attributes.trending; }
  get createdAt(): string { return this.attributes.createdAt; }
  get updatedAt(): string { return this.attributes.updatedAt; }
  get isLiked(): boolean { return this.attributes.isLiked; }

  // Domain behaviors - encapsulated business logic
  getDisplayImage(): string {
    return this.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b";
  }

  isCreatedByUser(userId: number): boolean {
    return this.userId === userId;
  }

  getFormattedDate(): string {
    return new Date(this.createdAt).toLocaleDateString();
  }
  
  // Domain behavior - get the project's status based on its attributes
  getStatus(): ProjectStatus {
    if (this.featured) return "featured";
    if (this.trending) return "trending";
    
    // Check if project is new (less than 7 days old)
    const createdDate = new Date(this.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreation < 7) return "new";
    
    return "regular";
  }
  
  // Returns a truncated description for UI display
  getTruncatedDescription(maxLength: number = 100): string {
    if (this.description.length <= maxLength) return this.description;
    return this.description.substring(0, maxLength).trim() + "...";
  }
  
  // Get popularity score based on views and likes
  getPopularityScore(): number {
    return this.views + (this.likes * 5); // Likes weighted higher than views
  }
  
  // Calculate star rating based on likes
  getStarRating(): number {
    const baseRating = Math.min(Math.round(this.likes / 5), 5);
    return Math.max(1, baseRating); // Minimum 1 star
  }
  
  // Format view count for display (e.g., "1.2K" instead of "1200")
  getFormattedViewCount(): string {
    return this.views >= 1000 
      ? `${(this.views / 1000).toFixed(1)}K` 
      : this.views.toString();
  }
  
  // Gets URL-friendly slug from title
  getSlug(): string {
    return this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  // Static factory methods
  static create(attrs: ProjectAttributes): Project {
    return new Project(attrs);
  }

  static createMany(projectsData: ProjectAttributes[]): Project[] {
    return projectsData.map(data => Project.create(data));
  }
}