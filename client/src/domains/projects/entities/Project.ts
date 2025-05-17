import { z } from 'zod';

/**
 * Project Categories Enum
 * These are the valid categories for a project
 */
export type ProjectCategory = 
  | "Web App" 
  | "Game" 
  | "API" 
  | "Mobile" 
  | "React" 
  | "JavaScript" 
  | "UI/UX" 
  | "Library" 
  | "Portfolio" 
  | "AI"
  | "Other";

/**
 * Project Status Types
 * Used for filtering projects by their status
 */
export type ProjectStatus = 'featured' | 'trending' | 'new' | 'popular';

/**
 * Project Attributes Schema
 * Contains all the attributes that define a project
 */
export interface ProjectAttributes {
  id: number;
  userId?: number;
  username: string;
  title: string;
  description: string;
  category: ProjectCategory;
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

/**
 * Project Entity - Core Domain Entity
 * Follows Domain-Driven Design principles with encapsulated business logic
 */
export class Project {
  // Project properties - mirrors interface but with private fields
  private readonly _id: number;
  private readonly _userId?: number;
  private readonly _username: string;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _category: ProjectCategory;
  private readonly _projectUrl: string;
  private readonly _previewUrl: string;
  private readonly _thumbnailUrl?: string;
  private readonly _views: number;
  private readonly _likes: number;
  private readonly _featured: boolean;
  private readonly _trending: boolean;
  private readonly _createdAt: string;
  private readonly _updatedAt: string;
  private readonly _isLiked: boolean;

  // Private constructor - use the factory method instead
  private constructor(attributes: ProjectAttributes) {
    this._id = attributes.id;
    this._userId = attributes.userId;
    this._username = attributes.username;
    this._title = attributes.title;
    this._description = attributes.description;
    this._category = attributes.category as ProjectCategory;
    this._projectUrl = attributes.projectUrl;
    this._previewUrl = attributes.previewUrl;
    this._thumbnailUrl = attributes.thumbnailUrl;
    this._views = attributes.views;
    this._likes = attributes.likes;
    this._featured = attributes.featured;
    this._trending = attributes.trending;
    this._createdAt = attributes.createdAt;
    this._updatedAt = attributes.updatedAt;
    this._isLiked = attributes.isLiked;
  }

  /**
   * Factory method to create a Project entity
   * @param attributes Raw project attributes
   * @returns A validated Project entity
   */
  static create(attributes: ProjectAttributes): Project {
    // Use a more lenient schema that accounts for real-world API data
    const projectSchema = z.object({
      id: z.number(),
      userId: z.number().optional(),
      username: z.string(),
      title: z.string().min(1, "Title is required"),
      description: z.string(),
      category: z.string(),
      projectUrl: z.string(), // Don't require valid URL format for flexibility
      previewUrl: z.string(),
      thumbnailUrl: z.string().optional(),
      views: z.number().nonnegative(),
      likes: z.number().nonnegative(),
      featured: z.boolean(),
      trending: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
      isLiked: z.boolean(),
    });

    try {
      projectSchema.parse(attributes);
      return new Project(attributes);
    } catch (error) {
      console.warn(`Schema validation error: ${error instanceof Error ? error.message : String(error)}`);
      
      // Instead of throwing, try to create a valid project with the data we have
      try {
        return new Project({
          ...attributes,
          // Ensure required properties exist with fallbacks
          id: attributes.id || 0,
          username: attributes.username || 'Unknown',
          title: attributes.title || 'Untitled Project',
          description: attributes.description || '',
          category: attributes.category || 'Other',
          projectUrl: attributes.projectUrl || '#',
          previewUrl: attributes.previewUrl || '/placeholder-image.png',
          views: typeof attributes.views === 'number' ? attributes.views : 0,
          likes: typeof attributes.likes === 'number' ? attributes.likes : 0,
          featured: Boolean(attributes.featured),
          trending: Boolean(attributes.trending),
          createdAt: attributes.createdAt || new Date().toISOString(),
          updatedAt: attributes.updatedAt || new Date().toISOString(),
          isLiked: Boolean(attributes.isLiked)
        });
      } catch (fallbackError) {
        console.error('Failed to create project even with fallback:', fallbackError);
        throw new Error(`Invalid project data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Create a new Project from API response data
   * @param data API response data
   * @returns A new Project entity
   */
  static fromApiResponse(data: any): Project {
    try {
      // Handle possible missing or malformed data from API
      const projectData: ProjectAttributes = {
        id: data.id || 0,
        userId: data.userId,
        username: data.username || 'Unknown',
        title: data.title || 'Untitled Project',
        description: data.description || '',
        category: data.category || 'Other',
        projectUrl: data.projectUrl || '#',
        previewUrl: data.previewUrl || '/placeholder-image.png',
        thumbnailUrl: data.thumbnailUrl,
        views: typeof data.views === 'number' ? data.views : 0,
        likes: typeof data.likes === 'number' ? data.likes : 0,
        featured: !!data.featured,
        trending: !!data.trending,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        isLiked: !!data.isLiked
      };
      
      return Project.create(projectData);
    } catch (error) {
      console.error('Error creating Project entity from API data:', error);
      
      // Create a minimal valid project to prevent UI errors
      return Project.create({
        id: data.id || 0,
        username: 'Unknown',
        title: 'Error Loading Project',
        description: 'There was an error loading this project',
        category: 'Other',
        projectUrl: '#',
        previewUrl: '/placeholder-image.png',
        views: 0,
        likes: 0,
        featured: false,
        trending: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isLiked: false
      });
    }
  }

  /**
   * Create a collection of Projects from API response data
   * @param dataArray Array of API response data
   * @returns Array of Project entities
   */
  static fromApiResponseArray(dataArray: any[]): Project[] {
    return dataArray.map(data => Project.fromApiResponse(data));
  }

  // Getters (read-only public properties)
  get id(): number { return this._id; }
  get userId(): number | undefined { return this._userId; }
  get username(): string { return this._username; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get category(): ProjectCategory { return this._category; }
  get projectUrl(): string { return this._projectUrl; }
  get previewUrl(): string { return this._previewUrl; }
  get thumbnailUrl(): string | undefined { return this._thumbnailUrl; }
  get views(): number { return this._views; }
  get likes(): number { return this._likes; }
  get featured(): boolean { return this._featured; }
  get trending(): boolean { return this._trending; }
  get createdAt(): string { return this._createdAt; }
  get updatedAt(): string { return this._updatedAt; }
  get isLiked(): boolean { return this._isLiked; }

  // Business logic methods
  
  /**
   * Get the best image to display for this project
   */
  getDisplayImage(): string {
    return this._thumbnailUrl || this._previewUrl;
  }

  /**
   * Format the creation date in a human-readable format
   */
  getFormattedDate(): string {
    const date = new Date(this._createdAt);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  /**
   * Format the view count for display
   */
  getFormattedViewCount(): string {
    return this._views >= 1000 
      ? `${(this._views / 1000).toFixed(1)}k` 
      : this._views.toString();
  }

  /**
   * Format the like count for display
   */
  getFormattedLikeCount(): string {
    return this._likes >= 1000 
      ? `${(this._likes / 1000).toFixed(1)}k` 
      : this._likes.toString();
  }

  /**
   * Calculate a star rating (1-5) based on views and likes
   */
  getStarRating(): number {
    // Simple algorithm: mix of popularity (views) and engagement (likes)
    const viewsScore = Math.min(this._views / 100, 3);
    const likesScore = Math.min((this._likes / Math.max(this._views, 1)) * 10, 2);
    
    return Math.round(viewsScore + likesScore);
  }

  /**
   * Check if the project is new (created in the last 7 days)
   */
  isNew(): boolean {
    const creationDate = new Date(this._createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - creationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7;
  }

  /**
   * Convert the project to a plain object for serialization
   */
  toJSON(): ProjectAttributes {
    return {
      id: this._id,
      userId: this._userId,
      username: this._username,
      title: this._title,
      description: this._description,
      category: this._category,
      projectUrl: this._projectUrl,
      previewUrl: this._previewUrl,
      thumbnailUrl: this._thumbnailUrl,
      views: this._views,
      likes: this._likes,
      featured: this._featured,
      trending: this._trending,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      isLiked: this._isLiked,
    };
  }
}