import { Project, ProjectLike, ProjectView } from "@shared/schema";

// Domain entities
export interface UserProjectEntity {
  project: Project;
  analytics: ProjectAnalytics;
  engagement: ProjectEngagement;
}

export interface ProjectAnalytics {
  dailyViews: DailyMetric[];
  weeklyViews: DailyMetric[];
  monthlyViews: DailyMetric[];
  totalViews: number;
}

export interface ProjectEngagement {
  likes: number;
  isLiked: boolean;
  conversionRate: number; // views to likes ratio
  growthRate: number; // week-over-week growth rate
}

export interface DailyMetric {
  date: string;
  count: number;
}

// Value objects
export class ProjectId {
  constructor(public readonly value: number) {
    if (value <= 0) {
      throw new Error("Project ID must be positive");
    }
  }
}

export class UserId {
  constructor(public readonly value: number) {
    if (value <= 0) {
      throw new Error("User ID must be positive");
    }
  }
}

// Repository interfaces (Domain-driven design pattern)
export interface UserProjectsRepository {
  getUserProjects(userId: UserId): Promise<UserProjectEntity[]>;
  getProjectById(projectId: ProjectId, userId: UserId): Promise<UserProjectEntity | null>;
  getProjectAnalytics(projectId: ProjectId): Promise<ProjectAnalytics>;
  getProjectEngagement(projectId: ProjectId, userId: UserId): Promise<ProjectEngagement>;
}

// Domain services
export interface AnalyticsCalculationService {
  calculateProjectAnalytics(views: ProjectView[]): ProjectAnalytics;
  calculateProjectEngagement(project: Project, likes: ProjectLike[], userId: number): ProjectEngagement;
}