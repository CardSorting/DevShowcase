/**
 * Project Entity - Core Domain Model
 * Represents a project in our domain with all its properties and behavior
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

export class Project {
  private attributes: ProjectAttributes;

  constructor(attrs: ProjectAttributes) {
    this.attributes = attrs;
  }

  // Getters for all properties
  get id(): number { return this.attributes.id; }
  get userId(): number | undefined { return this.attributes.userId; }
  get username(): string { return this.attributes.username; }
  get title(): string { return this.attributes.title; }
  get description(): string { return this.attributes.description; }
  get category(): string { return this.attributes.category; }
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

  // Domain behaviors
  getDisplayImage(): string {
    return this.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b";
  }

  isCreatedByUser(userId: number): boolean {
    return this.userId === userId;
  }

  getFormattedDate(): string {
    return new Date(this.createdAt).toLocaleDateString();
  }

  // Static factory methods
  static create(attrs: ProjectAttributes): Project {
    return new Project(attrs);
  }

  static createMany(projectsData: ProjectAttributes[]): Project[] {
    return projectsData.map(data => Project.create(data));
  }
}