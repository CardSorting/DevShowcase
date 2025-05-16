-- Create sessions table for auth persistence
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" varchar NOT NULL PRIMARY KEY,
  "sess" jsonb NOT NULL,
  "expire" timestamp(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");

-- Modify users table to support Replit Auth
ALTER TABLE users 
  ALTER COLUMN id TYPE varchar,
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN username DROP NOT NULL,
  ALTER COLUMN password DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS profile_image_url varchar;