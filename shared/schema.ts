import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  githubId: text("github_id").unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  email: text("email"),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  projectUrl: text("project_url").notNull(),
  previewUrl: text("preview_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  zipPath: text("zip_path").notNull(),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  trending: boolean("trending").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project views table to track unique views
export const projectViews = pgTable("project_views", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  visitorId: text("visitor_id").notNull(), // Could be IP or session ID
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

// Project likes table to track who liked which project
export const projectLikes = pgTable("project_likes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  visitorId: text("visitor_id"), // For anonymous likes
  likedAt: timestamp("liked_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertProjectSchema = createInsertSchema(projects)
  .omit({ id: true, views: true, likes: true, featured: true, trending: true, createdAt: true, updatedAt: true });

export const insertProjectViewSchema = createInsertSchema(projectViews)
  .omit({ id: true, viewedAt: true });

export const insertProjectLikeSchema = createInsertSchema(projectLikes)
  .omit({ id: true, likedAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertProjectView = z.infer<typeof insertProjectViewSchema>;
export type ProjectView = typeof projectViews.$inferSelect;

export type InsertProjectLike = z.infer<typeof insertProjectLikeSchema>;
export type ProjectLike = typeof projectLikes.$inferSelect;
