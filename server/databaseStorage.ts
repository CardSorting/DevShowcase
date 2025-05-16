import {
  type Project,
  type InsertProject,
  type ProjectView,
  type InsertProjectView,
  type ProjectLike,
  type InsertProjectLike,
  type User,
  type InsertUser,
  type UpsertUser,
  users,
  projects,
  projectViews,
  projectLikes
} from "@shared/schema";
import { Project as ProjectType } from "@shared/types";
import { db, pool } from "./db";
import { eq, and, desc, asc, like, or, inArray, sql, count } from "drizzle-orm";
import { IStorage } from "./storage";
import type { ProjectFilters } from "./storage";

// Utility for retry logic
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> => {
  try {
    return await fn();
  } catch (err: any) {
    if (
      retries > 0 && 
      (err.message?.includes('rate limit') || err.code === 'XX000')
    ) {
      console.log(`Database rate limit hit, retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 1.5);
    }
    throw err;
  }
};

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return withRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    });
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return withRetry(async () => {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    });
  }

  // Project methods
  async getProjects(filters: ProjectFilters): Promise<{
    projects: ProjectType[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    categoryCounts: { [key: string]: number };
  }> {
    return withRetry(async () => {
      const { sort, categories, popularity, search, page, visitorId } = filters;
      const pageSize = 8;
      const offset = (page - 1) * pageSize;
      
      // Build query conditions
      let queryConditions: any[] = [];
      
      // Filter by categories if provided
      if (categories.length > 0) {
        queryConditions.push(inArray(projects.category, categories));
      }
      
      // Filter by popularity
      if (popularity === "trending") {
        queryConditions.push(eq(projects.trending, true));
      } else if (popularity === "popular") {
        queryConditions.push(sql`${projects.views} >= 1000`);
      } else if (popularity === "featured") {
        queryConditions.push(eq(projects.featured, true));
      }
      
      // Filter by search query
      if (search) {
        queryConditions.push(
          or(
            like(projects.title, `%${search}%`),
            like(projects.description, `%${search}%`)
          )
        );
      }

      // Create the where condition if needed
      const whereCondition = queryConditions.length > 0 ? and(...queryConditions) : undefined;

      // Fetch total count first (separate query to avoid rate limits)
      const totalCountResult = await db
        .select({ count: count() })
        .from(projects)
        .where(whereCondition);
        
      const totalCount = Number(totalCountResult[0]?.count ?? 0);
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Execute the query with sorting and pagination
      let projectsResult;
      
      // We need to handle the query building differently due to TypeScript limitations
      if (sort === "recent") {
        projectsResult = await db.select()
          .from(projects)
          .where(whereCondition)
          .orderBy(desc(projects.createdAt))
          .limit(pageSize)
          .offset(offset);
      } else if (sort === "views") {
        projectsResult = await db.select()
          .from(projects)
          .where(whereCondition)
          .orderBy(desc(projects.views))
          .limit(pageSize)
          .offset(offset);
      } else if (sort === "trending") {
        projectsResult = await db.select()
          .from(projects)
          .where(whereCondition)
          .orderBy(desc(projects.trending))
          .orderBy(desc(projects.views))
          .orderBy(desc(projects.likes))
          .limit(pageSize)
          .offset(offset);
      } else {
        // Popular is the default sort - by likes
        projectsResult = await db.select()
          .from(projects)
          .where(whereCondition)
          .orderBy(desc(projects.likes))
          .limit(pageSize)
          .offset(offset);
      }
      
      // Small delay to avoid hitting rate limits between queries
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Get category counts (in a separate query)
      const categoryCounts = await db
        .select({
          category: projects.category,
          count: count(),
        })
        .from(projects)
        .groupBy(projects.category);
      
      // Convert to category count object
      const categoryCountsObject: { [key: string]: number } = {};
      categoryCounts.forEach((item) => {
        categoryCountsObject[item.category] = Number(item.count);
      });
      
      // Find project likes all at once instead of individually
      const projectIds = projectsResult.map((p: any) => p.id);
      const likesForProjects = projectIds.length > 0 
        ? await db
            .select()
            .from(projectLikes)
            .where(
              and(
                inArray(projectLikes.projectId, projectIds),
                eq(projectLikes.visitorId, visitorId)
              )
            )
        : [];
      
      // Create a map of projectId -> isLiked
      const projectLikeMap = new Map<number, boolean>();
      likesForProjects.forEach(like => {
        projectLikeMap.set(like.projectId, true);
      });
      
      // Get all user ids needed
      const userIds = projectsResult
        .map((p: any) => p.userId)
        .filter((id: any): id is string => id !== null);
        
      // Fetch all users in one query if there are any user IDs
      const userMap = new Map<string, User>();
      if (userIds.length > 0) {
        const usersResult = await db
          .select()
          .from(users)
          .where(inArray(users.id, userIds));
          
        usersResult.forEach(user => {
          userMap.set(user.id, user);
        });
      }
      
      // Transform projects with user data and like status
      const enrichedProjects = projectsResult.map((project: any) => {
        const user = project.userId !== null ? userMap.get(project.userId) : undefined;
        const isLiked = projectLikeMap.get(project.id) || false;
        
        // Convert DB date to string format to match Project interface
        const formattedProject = {
          ...project,
          userId: project.userId ?? undefined, // Convert null to undefined to match ProjectType
          isLiked,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString()
        };
        
        return formattedProject as unknown as ProjectType;
      });
      
      return {
        projects: enrichedProjects,
        totalCount,
        totalPages,
        currentPage: page,
        categoryCounts: categoryCountsObject,
      };
    });
  }

  async getProjectById(id: number, visitorId?: string): Promise<ProjectType | undefined> {
    return withRetry(async () => {
      const [project] = await db.select().from(projects).where(eq(projects.id, id));
      if (!project) return undefined;

      let user;
      let isLiked = false;
      
      // Load user and liked status in parallel to reduce database load
      if (project.userId !== null || visitorId) {
        const [userResult, likedResult] = await Promise.all([
          project.userId !== null ? this.getUser(project.userId) : Promise.resolve(undefined),
          visitorId ? this.isProjectLikedByVisitor(id, visitorId) : Promise.resolve(false)
        ]);
        
        user = userResult;
        isLiked = likedResult;
      }

      // Convert database dates to string format to match ProjectType interface
      const formattedProject = {
        ...project,
        userId: project.userId ?? undefined, // Convert null to undefined to match ProjectType
        username: user?.username || "Anonymous",
        isLiked,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      };

      return formattedProject as unknown as ProjectType;
    });
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    return withRetry(async () => {
      const [project] = await db.insert(projects).values(insertProject).returning();
      return project;
    });
  }

  async updateProject(id: number, data: Partial<Project>): Promise<Project | undefined> {
    return withRetry(async () => {
      const [updatedProject] = await db
        .update(projects)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();
      
      return updatedProject;
    });
  }

  async deleteProject(id: number): Promise<boolean> {
    return withRetry(async () => {
      const result = await db.delete(projects).where(eq(projects.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  // View tracking
  async recordProjectView(projectId: number, visitorId: string): Promise<void> {
    return withRetry(async () => {
      // Check if project exists
      const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
      if (!project) {
        throw new Error("Project not found");
      }

      // Check if visitor has already viewed this project
      const [existingView] = await db
        .select()
        .from(projectViews)
        .where(
          and(
            eq(projectViews.projectId, projectId),
            eq(projectViews.visitorId, visitorId)
          )
        );

      if (!existingView) {
        // Add view record
        await db.insert(projectViews).values({
          projectId,
          visitorId,
        });

        // Wait briefly to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 30));

        // Increment view count
        await db
          .update(projects)
          .set({ 
            views: project.views + 1,
            trending: (project.views + 1 > 100 && project.likes > 10) ? true : project.trending
          })
          .where(eq(projects.id, projectId));
      }
    });
  }

  // Like tracking
  async toggleProjectLike(projectId: number, visitorId: string): Promise<{ liked: boolean }> {
    return withRetry(async () => {
      // Check if project exists
      const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
      if (!project) {
        throw new Error("Project not found");
      }

      // Check if visitor has already liked this project
      const [existingLike] = await db
        .select()
        .from(projectLikes)
        .where(
          and(
            eq(projectLikes.projectId, projectId),
            eq(projectLikes.visitorId, visitorId)
          )
        );

      if (existingLike) {
        // Unlike: remove the like
        await db
          .delete(projectLikes)
          .where(eq(projectLikes.id, existingLike.id));

        // Wait briefly to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 30));

        // Decrement like count
        await db
          .update(projects)
          .set({ likes: project.likes - 1 })
          .where(eq(projects.id, projectId));

        return { liked: false };
      } else {
        // Like: add a new like
        await db.insert(projectLikes).values({
          projectId,
          visitorId,
        });

        // Wait briefly to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 30));

        // Increment like count
        await db
          .update(projects)
          .set({ likes: project.likes + 1 })
          .where(eq(projects.id, projectId));

        return { liked: true };
      }
    });
  }

  // Helper to check if a visitor has liked a project
  private async isProjectLikedByVisitor(projectId: number, visitorId: string): Promise<boolean> {
    return withRetry(async () => {
      const [existingLike] = await db
        .select()
        .from(projectLikes)
        .where(
          and(
            eq(projectLikes.projectId, projectId),
            eq(projectLikes.visitorId, visitorId)
          )
        );
      
      return !!existingLike;
    });
  }
}