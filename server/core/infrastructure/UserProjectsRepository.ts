import { db } from "../../db";
import { 
  ProjectId, 
  ProjectAnalytics, 
  ProjectEngagement, 
  UserId, 
  UserProjectEntity, 
  UserProjectsRepository,
  DailyMetric 
} from "../domain/models/UserProjectsModel";
import { 
  projects, 
  projectLikes, 
  projectViews, 
  Project, 
  ProjectLike, 
  ProjectView 
} from "@shared/schema";
import { eq, and, sql, desc, gte, lt } from "drizzle-orm";
import { Project as ProjectType } from "@shared/types";

/**
 * Infrastructure implementation of the UserProjectsRepository
 * This converts database entities to domain objects
 */
export class PostgresUserProjectsRepository implements UserProjectsRepository {
  async getUserProjects(userId: UserId): Promise<UserProjectEntity[]> {
    // Get all projects for the user
    const userProjects = await db.select()
      .from(projects)
      .where(eq(projects.userId, userId.value))
      .orderBy(desc(projects.createdAt));
    
    // For each project, fetch analytics and engagement data
    const result: UserProjectEntity[] = [];
    
    for (const project of userProjects) {
      const analytics = await this.getProjectAnalytics(new ProjectId(project.id));
      const engagement = await this.getProjectEngagement(new ProjectId(project.id), userId);
      
      result.push({
        project,
        analytics,
        engagement
      });
    }
    
    return result;
  }
  
  async getProjectById(projectId: ProjectId, userId: UserId): Promise<UserProjectEntity | null> {
    // Get project with access control check
    const [project] = await db.select()
      .from(projects)
      .where(and(
        eq(projects.id, projectId.value),
        eq(projects.userId, userId.value)
      ));
    
    if (!project) {
      return null;
    }
    
    // Get analytics and engagement
    const analytics = await this.getProjectAnalytics(projectId);
    const engagement = await this.getProjectEngagement(projectId, userId);
    
    return {
      project,
      analytics,
      engagement
    };
  }
  
  async getProjectAnalytics(projectId: ProjectId): Promise<ProjectAnalytics> {
    // Get all views for the project
    const views = await db.select()
      .from(projectViews)
      .where(eq(projectViews.projectId, projectId.value));
    
    // Calculate daily metrics for the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    // Filter views by date ranges
    const monthlyViews = views.filter(view => 
      new Date(view.viewedAt) >= thirtyDaysAgo
    );
    
    const weeklyViews = views.filter(view => 
      new Date(view.viewedAt) >= sevenDaysAgo
    );
    
    // Group by date for daily metrics
    const dailyViewsMap = new Map<string, number>();
    const weeklyViewsMap = new Map<string, number>();
    const monthlyViewsMap = new Map<string, number>();
    
    // Initialize maps with all dates in range
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (i < 7) {
        weeklyViewsMap.set(dateStr, 0);
      }
      
      monthlyViewsMap.set(dateStr, 0);
      
      if (i < 7) {
        dailyViewsMap.set(dateStr, 0);
      }
    }
    
    // Count views by date
    for (const view of monthlyViews) {
      const date = new Date(view.viewedAt).toISOString().split('T')[0];
      
      if (monthlyViewsMap.has(date)) {
        monthlyViewsMap.set(date, (monthlyViewsMap.get(date) || 0) + 1);
      }
      
      if (new Date(view.viewedAt) >= sevenDaysAgo && weeklyViewsMap.has(date)) {
        weeklyViewsMap.set(date, (weeklyViewsMap.get(date) || 0) + 1);
      }
      
      if (new Date(view.viewedAt) >= sevenDaysAgo && dailyViewsMap.has(date)) {
        dailyViewsMap.set(date, (dailyViewsMap.get(date) || 0) + 1);
      }
    }
    
    // Convert maps to arrays for the response
    const dailyMetrics: DailyMetric[] = Array.from(dailyViewsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const weeklyMetrics: DailyMetric[] = Array.from(weeklyViewsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const monthlyMetrics: DailyMetric[] = Array.from(monthlyViewsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      dailyViews: dailyMetrics,
      weeklyViews: weeklyMetrics,
      monthlyViews: monthlyMetrics,
      totalViews: views.length
    };
  }
  
  async getProjectEngagement(projectId: ProjectId, userId: UserId): Promise<ProjectEngagement> {
    // Get project likes
    const likes = await db.select()
      .from(projectLikes)
      .where(eq(projectLikes.projectId, projectId.value));
    
    // Check if this user has liked the project
    const userLike = likes.find(like => 
      like.userId === userId.value || 
      like.visitorId === userId.value.toString()
    );
    
    // Get views count for conversion rate
    const views = await db.select()
      .from(projectViews)
      .where(eq(projectViews.projectId, projectId.value));
    
    // Get views from previous week for growth rate
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    const currentWeekViews = views.filter(view => 
      new Date(view.viewedAt) >= oneWeekAgo
    ).length;
    
    const previousWeekViews = views.filter(view => 
      new Date(view.viewedAt) >= twoWeeksAgo && 
      new Date(view.viewedAt) < oneWeekAgo
    ).length;
    
    // Calculate growth rate
    const growthRate = previousWeekViews === 0 
      ? currentWeekViews > 0 ? 100 : 0 
      : ((currentWeekViews - previousWeekViews) / previousWeekViews) * 100;
    
    // Calculate conversion rate (likes to views ratio)
    const conversionRate = views.length === 0 
      ? 0 
      : (likes.length / views.length) * 100;
    
    return {
      likes: likes.length,
      isLiked: !!userLike,
      conversionRate,
      growthRate
    };
  }
}