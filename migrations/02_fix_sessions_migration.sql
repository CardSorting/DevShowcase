-- First drop the foreign key constraints referencing users.id
ALTER TABLE IF EXISTS project_likes DROP CONSTRAINT IF EXISTS project_likes_user_id_users_id_fk;
ALTER TABLE IF EXISTS projects DROP CONSTRAINT IF EXISTS projects_user_id_users_id_fk;

-- Now modify the users table
ALTER TABLE users 
  ALTER COLUMN id TYPE varchar,
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN username DROP NOT NULL,
  ALTER COLUMN password DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS profile_image_url varchar;

-- Recreate the foreign key constraints with the updated type
ALTER TABLE project_likes 
  ADD CONSTRAINT project_likes_user_id_users_id_fk 
  FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE projects 
  ADD CONSTRAINT projects_user_id_users_id_fk 
  FOREIGN KEY (user_id) REFERENCES users(id);