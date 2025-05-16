-- Ensure sessions table exists
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" varchar NOT NULL PRIMARY KEY,
  "sess" jsonb NOT NULL,
  "expire" timestamp(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");

-- Drop existing foreign key constraints
ALTER TABLE IF EXISTS project_likes DROP CONSTRAINT IF EXISTS project_likes_user_id_users_id_fk;
ALTER TABLE IF EXISTS projects DROP CONSTRAINT IF EXISTS projects_user_id_users_id_fk;

-- Modify users table to support Replit Auth
ALTER TABLE users 
  ALTER COLUMN id TYPE varchar USING id::varchar,
  ALTER COLUMN username DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS profile_image_url varchar;

-- Modify related tables to match the user_id type
ALTER TABLE projects
  ALTER COLUMN user_id TYPE varchar USING user_id::varchar;

ALTER TABLE project_likes
  ALTER COLUMN user_id TYPE varchar USING user_id::varchar;

-- Recreate foreign key constraints with the updated types
ALTER TABLE project_likes 
  ADD CONSTRAINT project_likes_user_id_users_id_fk 
  FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE projects 
  ADD CONSTRAINT projects_user_id_users_id_fk 
  FOREIGN KEY (user_id) REFERENCES users(id);