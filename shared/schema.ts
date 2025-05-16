import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Session storage table for Replit Auth
 * Required for maintaining user sessions
 */
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

/**
 * Enhanced users table with Replit Auth fields
 * Using string ID from Replit Auth as primary key
 */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Replit Auth user ID
  email: varchar("email", { length: 100 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  username: varchar("username", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Projects table with user association
 * Now references the string ID from users table
 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(), // Required user association
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

/**
 * Project views table to track unique views
 */
export const projectViews = pgTable("project_views", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  visitorId: text("visitor_id").notNull(), // Could be IP or session ID
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

/**
 * Project likes table to track who liked which project
 */
export const projectLikes = pgTable("project_likes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: varchar("user_id").references(() => users.id), // Updated to match user.id type
  visitorId: text("visitor_id"), // For anonymous likes
  likedAt: timestamp("liked_at").defaultNow().notNull(),
});

// Upsert schema for users using Replit Auth
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

// Insert schema for projects - now requires userId
export const insertProjectSchema = createInsertSchema(projects)
  .omit({ id: true, views: true, likes: true, featured: true, trending: true, createdAt: true, updatedAt: true });

export const insertProjectViewSchema = createInsertSchema(projectViews)
  .omit({ id: true, viewedAt: true });

export const insertProjectLikeSchema = createInsertSchema(projectLikes)
  .omit({ id: true, likedAt: true });

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertProjectView = z.infer<typeof insertProjectViewSchema>;
export type ProjectView = typeof projectViews.$inferSelect;

export type InsertProjectLike = z.infer<typeof insertProjectLikeSchema>;
export type ProjectLike = typeof projectLikes.$inferSelect;
