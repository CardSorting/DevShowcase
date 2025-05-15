import {
  type Project,
  type InsertProject,
  type ProjectView,
  type InsertProjectView,
  type ProjectLike,
  type InsertProjectLike,
  type User,
  type InsertUser,
  users,
  projects,
  projectViews,
  projectLikes
} from "@shared/schema";
import { Project as ProjectType } from "@shared/types";
import { db } from "./db";
import { eq, and, desc, asc, like, or, inArray, sql, count } from "drizzle-orm";
import { IStorage } from "./storage";
import type { ProjectFilters } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
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
    const pageSize = 8;
    const offset = (page - 1) * pageSize;

    // Start building the query with all conditions
    let query = db.select().from(projects);
    let queryConditions = [];

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

    // Apply all conditions if any exist
    if (queryConditions.length > 0) {
      query = query.where(and(...queryConditions));
    }

    // Add sorting
    switch (sort) {
      case "recent":
        query = query.orderBy(desc(projects.createdAt));
        break;
      case "views":
        query = query.orderBy(desc(projects.views));
        break;
      case "trending":
        // For trending, we'll prioritize trending flag and then sort by views
        query = query
          .orderBy(desc(projects.trending))
          .orderBy(desc(projects.views))
          .orderBy(desc(projects.likes));
        break;
      case "popular":
      default:
        // Popular is the default sort - by likes
        query = query.orderBy(desc(projects.likes));
    }

    // Execute the count query for total records
    const totalCountResult = await db
      .select({ count: count() })
      .from(projects)
      .where(queryConditions.length > 0 ? and(...queryConditions) : undefined);
    
    const totalCount = Number(totalCountResult[0]?.count ?? 0);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Execute the main query with pagination
    const projectsResult = await query.limit(pageSize).offset(offset);

    // Get category counts
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

    // Check liked status for each project
    const enrichedProjects = await Promise.all(
      projectsResult.map(async (project) => {
        const user = project.userId 
          ? await this.getUser(project.userId)
          : undefined;
        
        const isLiked = await this.isProjectLikedByVisitor(project.id, visitorId);
        
        return {
          ...project,
          username: user?.username || "Anonymous",
          isLiked,
        };
      })
    );

    return {
      projects: enrichedProjects,
      totalCount,
      totalPages,
      currentPage: page,
      categoryCounts: categoryCountsObject,
    };
  }

  async getProjectById(id: number, visitorId?: string): Promise<ProjectType | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project) return undefined;

    const user = project.userId 
      ? await this.getUser(project.userId)
      : undefined;
    
    const isLiked = visitorId 
      ? await this.isProjectLikedByVisitor(id, visitorId)
      : false;

    return {
      ...project,
      username: user?.username || "Anonymous",
      isLiked,
    };
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, data: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  // View tracking
  async recordProjectView(projectId: number, visitorId: string): Promise<void> {
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

      // Increment view count
      await db
        .update(projects)
        .set({ 
          views: project.views + 1,
          trending: (project.views + 1 > 100 && project.likes > 10) ? true : project.trending
        })
        .where(eq(projects.id, projectId));
    }
  }

  // Like tracking
  async toggleProjectLike(projectId: number, visitorId: string): Promise<{ liked: boolean }> {
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

      // Increment like count
      await db
        .update(projects)
        .set({ likes: project.likes + 1 })
        .where(eq(projects.id, projectId));

      return { liked: true };
    }
  }

  // Helper to check if a visitor has liked a project
  private async isProjectLikedByVisitor(projectId: number, visitorId: string): Promise<boolean> {
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
  }
}