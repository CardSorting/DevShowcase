export interface Project {
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
  isLiked: boolean; // Client-side property indicating if current user liked this project
}

export interface ProjectList {
  projects: Project[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  categoryCounts: {
    [key: string]: number;
  };
}

export interface UploadResponse {
  id: number;
  title: string;
  projectUrl: string;
}

export interface ErrorResponse {
  message: string;
}
