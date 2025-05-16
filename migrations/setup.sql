-- Create enum type for roles
CREATE TYPE "role" AS ENUM ('admin', 'developer', 'user');

-- Alter users table to add new columns
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "email" varchar NOT NULL DEFAULT 'user@example.com',
  ADD COLUMN IF NOT EXISTS "first_name" varchar,
  ADD COLUMN IF NOT EXISTS "last_name" varchar,
  ADD COLUMN IF NOT EXISTS "role" "role" NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "last_login" timestamp,
  ADD COLUMN IF NOT EXISTS "created_at" timestamp NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp NOT NULL DEFAULT now();

-- Create permissions table
CREATE TABLE IF NOT EXISTS "permissions" (
  "id" serial PRIMARY KEY,
  "name" varchar(100) NOT NULL UNIQUE,
  "description" text,
  "resource" varchar(50) NOT NULL,
  "action" varchar(50) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS "role_permissions" (
  "id" serial PRIMARY KEY,
  "role" "role" NOT NULL,
  "permission_id" integer NOT NULL REFERENCES "permissions"("id"),
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Create sessions table for auth
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" varchar PRIMARY KEY,
  "sess" jsonb NOT NULL,
  "expire" timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");

-- Insert default permissions
INSERT INTO "permissions" ("name", "description", "resource", "action")
VALUES
  ('view_projects', 'View all projects', 'project', 'read'),
  ('create_project', 'Create new project', 'project', 'create'),
  ('edit_project', 'Edit project details', 'project', 'update'),
  ('delete_project', 'Delete a project', 'project', 'delete'),
  ('feature_project', 'Feature a project', 'project', 'feature'),
  ('view_users', 'View all users', 'user', 'read'),
  ('create_user', 'Create new user', 'user', 'create'),
  ('edit_user', 'Edit user details', 'user', 'update'),
  ('delete_user', 'Delete a user', 'user', 'delete'),
  ('manage_permissions', 'Manage role permissions', 'permission', 'manage')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Admin role gets all permissions
INSERT INTO "role_permissions" ("role", "permission_id")
SELECT 'admin', id FROM "permissions"
ON CONFLICT DO NOTHING;

-- Developer role permissions
INSERT INTO "role_permissions" ("role", "permission_id")
SELECT 'developer', id FROM "permissions" 
WHERE "name" IN ('view_projects', 'create_project', 'edit_project', 'delete_project')
ON CONFLICT DO NOTHING;

-- User role permissions
INSERT INTO "role_permissions" ("role", "permission_id")
SELECT 'user', id FROM "permissions" 
WHERE "name" IN ('view_projects', 'create_project')
ON CONFLICT DO NOTHING;

-- Create a default admin user (password: admin123)
INSERT INTO "users" ("username", "password", "email", "role")
VALUES ('admin', '$2b$10$KmhROSRZ8XbdO8B5vcQAFePQwcIShoMopeV5QsQVX6Hf9f1KGwzJ.', 'admin@example.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Create a default developer user (password: developer123)
INSERT INTO "users" ("username", "password", "email", "role")
VALUES ('developer', '$2b$10$M6xPW9pf4XdC8rRAe5K.Su.NV0D7cd6a3hYSux61sZdDnQyKi.RZW', 'developer@example.com', 'developer')
ON CONFLICT (username) DO NOTHING;