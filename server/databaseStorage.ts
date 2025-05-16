import {
  users,
  projects,
  projectViews,
  projectLikes,
  permissions,
  rolePermissions,
  type User,
  type Project,
  type Permission,
  type RolePermission,
  type InsertUser,
  type InsertProject,
  type InsertPermission,
  type InsertRolePermission,
  type UpsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc, asc, sql, inArray, or } from "drizzle-orm";
import { IStorage, ProjectFilters } from "./storage";
import { Project as ProjectType } from "@shared/types";

/**
 * Database storage implementation that uses PostgreSQL
 * This class implements the IStorage interface
 */
export class DatabaseStorage implements IStorage {
  /**
   * Get a user by ID
   */
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  /**
   * Create a new user
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  /**
   * Upsert a user (create if not exists, update if exists)
   * Used for Replit Auth integration
   */
  async upsertUser(userData: UpsertUser): Promise<User> {
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
  }

  /**
   * Update a user
   */
  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  /**
   * Get projects with filtering, sorting, and pagination
   */
  async getProjects(filters: ProjectFilters): Promise<{
    projects: ProjectType[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    categoryCounts: { [key: string]: number };
  }> {
    // Default values and query setup
    const limit = 12;
    const offset = (filters.page - 1) * limit;
    
    // Build query conditions
    let conditions = sql`1=1`; // Default true condition
    
    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      conditions = and(conditions, inArray(projects.category, filters.categories));
    }
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions = and(
        conditions,
        or(
          like(projects.title, searchTerm),
          like(projects.description, searchTerm)
        )
      );
    }
    
    // Apply popularity filter
    if (filters.popularity === 'trending') {
      conditions = and(conditions, eq(projects.trending, true));
    } else if (filters.popularity === 'featured') {
      conditions = and(conditions, eq(projects.featured, true));
    }
    
    // Determine sort order
    let orderBy;
    if (filters.sort === 'newest') {
      orderBy = desc(projects.createdAt);
    } else if (filters.sort === 'oldest') {
      orderBy = asc(projects.createdAt);
    } else if (filters.sort === 'most-viewed') {
      orderBy = desc(projects.views);
    } else if (filters.sort === 'most-liked') {
      orderBy = desc(projects.likes);
    } else {
      // Default to newest
      orderBy = desc(projects.createdAt);
    }
    
    // Get category counts for faceted search
    const categoryCounts = await db
      .select({
        category: projects.category,
        count: sql<number>`count(*)`,
      })
      .from(projects)
      .groupBy(projects.category);
    
    // Convert to object format
    const categoryCountsObj: { [key: string]: number } = {};
    categoryCounts.forEach(item => {
      categoryCountsObj[item.category] = Number(item.count);
    });
    
    // Get total count for pagination
    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(projects)
      .where(conditions);
    
    // Get projects with pagination
    const projectsData = await db
      .select()
      .from(projects)
      .where(conditions)
      .limit(limit)
      .offset(offset)
      .orderBy(orderBy);
    
    // Add isLiked property to each project
    const projectsWithLikeStatus = await Promise.all(
      projectsData.map(async (project) => {
        const isLiked = filters.visitorId 
          ? await this.isProjectLikedByVisitor(project.id, filters.visitorId)
          : false;
        
        return {
          ...project,
          isLiked
        };
      })
    );

    const totalCount = Number(count);
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      projects: projectsWithLikeStatus,
      totalCount,
      totalPages,
      currentPage: filters.page,
      categoryCounts: categoryCountsObj
    };
  }

  /**
   * Get a project by ID with like status
   */
  async getProjectById(id: number, visitorId?: string): Promise<ProjectType | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    
    if (!project) return undefined;
    
    // Check if liked by visitor
    const isLiked = visitorId 
      ? await this.isProjectLikedByVisitor(id, visitorId)
      : false;
    
    return {
      ...project,
      isLiked
    };
  }

  /**
   * Create a new project
   */
  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  /**
   * Update a project
   */
  async updateProject(id: number, data: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  /**
   * Delete a project
   */
  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  /**
   * Record a project view from a unique visitor
   */
  async recordProjectView(projectId: number, visitorId: string): Promise<void> {
    // Check if view already exists from this visitor
    const [existingView] = await db
      .select()
      .from(projectViews)
      .where(
        and(
          eq(projectViews.projectId, projectId),
          eq(projectViews.visitorId, visitorId)
        )
      );
    
    // Only record view if it's new
    if (!existingView) {
      // Insert new view record
      await db.insert(projectViews).values({
        projectId,
        visitorId,
      });
      
      // Increment view count on project
      await db
        .update(projects)
        .set({ 
          views: sql`${projects.views} + 1`,
          updatedAt: new Date()
        })
        .where(eq(projects.id, projectId));
    }
  }

  /**
   * Toggle like status for a project and visitor
   */
  async toggleProjectLike(projectId: number, visitorId: string): Promise<{ liked: boolean }> {
    // Check if already liked
    const isLiked = await this.isProjectLikedByVisitor(projectId, visitorId);
    
    if (isLiked) {
      // Remove like
      await db
        .delete(projectLikes)
        .where(
          and(
            eq(projectLikes.projectId, projectId),
            eq(projectLikes.visitorId, visitorId)
          )
        );
      
      // Decrement like count
      await db
        .update(projects)
        .set({ 
          likes: sql`${projects.likes} - 1`,
          updatedAt: new Date()
        })
        .where(eq(projects.id, projectId));
      
      return { liked: false };
    } else {
      // Add like
      await db.insert(projectLikes).values({
        projectId,
        visitorId,
      });
      
      // Increment like count
      await db
        .update(projects)
        .set({ 
          likes: sql`${projects.likes} + 1`,
          updatedAt: new Date()
        })
        .where(eq(projects.id, projectId));
      
      return { liked: true };
    }
  }

  /**
   * Check if a project is liked by a specific visitor
   */
  private async isProjectLikedByVisitor(projectId: number, visitorId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(projectLikes)
      .where(
        and(
          eq(projectLikes.projectId, projectId),
          eq(projectLikes.visitorId, visitorId)
        )
      );
    
    return !!like;
  }

  /**
   * Get permissions for a user
   */
  async getUserPermissions(userId: string): Promise<{resource: string, action: string}[]> {
    // Get user role
    const user = await this.getUser(userId);
    if (!user) return [];
    
    // Get role permissions
    const rolePerms = await db
      .select({
        permission: permissions
      })
      .from(rolePermissions)
      .innerJoin(
        permissions,
        eq(rolePermissions.permissionId, permissions.id)
      )
      .where(eq(rolePermissions.role, user.role));
    
    // Return formatted permissions
    return rolePerms.map(rp => ({
      resource: rp.permission.resource,
      action: rp.permission.action
    }));
  }

  /**
   * Add a permission
   */
  async addPermission(name: string, description: string, resource: string, action: string): Promise<{ id: number }> {
    const [perm] = await db
      .insert(permissions)
      .values({
        name,
        description, 
        resource,
        action
      })
      .returning({ id: permissions.id });
    
    return { id: perm.id };
  }

  /**
   * Add a role permission
   */
  async addRolePermission(role: string, permissionId: number): Promise<{ id: number }> {
    const [rp] = await db
      .insert(rolePermissions)
      .values({
        role,
        permissionId
      })
      .returning({ id: rolePermissions.id });
    
    return { id: rp.id };
  }

  /**
   * Remove a role permission
   */
  async removeRolePermission(role: string, permissionId: number): Promise<boolean> {
    await db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.role, role),
          eq(rolePermissions.permissionId, permissionId)
        )
      );
    
    return true;
  }

  /**
   * Get projects by user ID
   */
  async getProjectsByUser(userId: string): Promise<ProjectType[]> {
    try {
      // Get all projects for the user
      const userProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(desc(projects.createdAt));
      
      // Format projects to include like status and proper typing
      const formattedProjects = userProjects.map(project => ({
        ...project,
        isLiked: false, // Default value since we don't have visitor ID here
        username: 'Owner', // Placeholder
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      })) as unknown as ProjectType[];
      
      return formattedProjects;
    } catch (error) {
      console.error("Error getting user projects:", error);
      return [];
    }
  }

  /**
   * Get analytics for a project
   */
  async getProjectAnalytics(projectId: number): Promise<any> {
    try {
      // Get project views
      const viewsData = await db
        .select({
          date: sql`DATE(${projectViews.viewedAt})`,
          count: sql`COUNT(${projectViews.id})`
        })
        .from(projectViews)
        .where(eq(projectViews.projectId, projectId))
        .groupBy(sql`DATE(${projectViews.viewedAt})`)
        .orderBy(sql`DATE(${projectViews.viewedAt})`);
      
      // Get project likes
      const likesData = await db
        .select({
          date: sql`DATE(${projectLikes.likedAt})`,
          count: sql`COUNT(${projectLikes.id})`
        })
        .from(projectLikes)
        .where(eq(projectLikes.projectId, projectId))
        .groupBy(sql`DATE(${projectLikes.likedAt})`)
        .orderBy(sql`DATE(${projectLikes.likedAt})`);
      
      // Get unique visitor count
      const uniqueVisitors = await db
        .select({ count: sql`COUNT(DISTINCT ${projectViews.visitorId})` })
        .from(projectViews)
        .where(eq(projectViews.projectId, projectId));
      
      // Get total views
      const totalViews = await db
        .select({ count: sql`COUNT(${projectViews.id})` })
        .from(projectViews)
        .where(eq(projectViews.projectId, projectId));
      
      // Get total likes
      const totalLikes = await db
        .select({ count: sql`COUNT(${projectLikes.id})` })
        .from(projectLikes)
        .where(eq(projectLikes.projectId, projectId));
      
      // Calculate metrics
      const visitorCount = uniqueVisitors[0]?.count || 0;
      const viewsCount = totalViews[0]?.count || 0;
      const likesCount = totalLikes[0]?.count || 0;
      
      // Calculate engagement rate (likes per view)
      const engagementRate = viewsCount > 0 ? (likesCount / viewsCount) * 100 : 0;
      
      return {
        viewsByDay: viewsData.map(item => ({
          date: item.date,
          views: Number(item.count)
        })),
        likesByDay: likesData.map(item => ({
          date: item.date,
          likes: Number(item.count)
        })),
        metrics: {
          uniqueVisitors: Number(visitorCount),
          totalViews: Number(viewsCount),
          totalLikes: Number(likesCount),
          engagementRate: parseFloat(engagementRate.toFixed(2))
        }
      };
    } catch (error) {
      console.error("Error getting project analytics:", error);
      return {
        viewsByDay: [],
        likesByDay: [],
        metrics: {
          uniqueVisitors: 0,
          totalViews: 0,
          totalLikes: 0,
          engagementRate: 0
        }
      };
    }
  }
}