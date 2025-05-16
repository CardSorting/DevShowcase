import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./shared/schema";

console.log("Pushing schema updates to database...");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  // Create sessions table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
  `);
  
  console.log("Sessions table created or verified");
  
  // Update users table
  await db.execute(`
    -- Check if user table exists and has new structure
    DO $$ 
    DECLARE
      email_exists BOOLEAN;
    BEGIN
      -- Check if email column exists
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email'
      ) INTO email_exists;
      
      -- If it doesn't exist, apply all changes
      IF NOT email_exists THEN
        -- Drop password column if it exists
        ALTER TABLE users DROP COLUMN IF EXISTS password;
        
        -- Add new columns
        ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS email VARCHAR UNIQUE,
          ADD COLUMN IF NOT EXISTS first_name VARCHAR,
          ADD COLUMN IF NOT EXISTS last_name VARCHAR,
          ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR,
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        
        -- Change ID column type - requires data migration
        -- First make temporary column
        ALTER TABLE users ADD COLUMN IF NOT EXISTS id_varchar VARCHAR;
        
        -- Convert existing IDs to varchar
        UPDATE users SET id_varchar = id::VARCHAR;
        
        -- Update references in other tables first
        ALTER TABLE projects 
          ADD COLUMN IF NOT EXISTS user_id_varchar VARCHAR;
        UPDATE projects 
          SET user_id_varchar = user_id::VARCHAR 
          WHERE user_id IS NOT NULL;
          
        ALTER TABLE project_likes 
          ADD COLUMN IF NOT EXISTS user_id_varchar VARCHAR;
        UPDATE project_likes 
          SET user_id_varchar = user_id::VARCHAR 
          WHERE user_id IS NOT NULL;
        
        -- Drop constraints and foreign keys
        ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
        ALTER TABLE project_likes DROP CONSTRAINT IF EXISTS project_likes_user_id_fkey;
        
        -- Drop original columns
        ALTER TABLE projects DROP COLUMN IF EXISTS user_id;
        ALTER TABLE project_likes DROP COLUMN IF EXISTS user_id;
        
        -- Rename new columns
        ALTER TABLE projects RENAME COLUMN user_id_varchar TO user_id;
        ALTER TABLE project_likes RENAME COLUMN user_id_varchar TO user_id;
        
        -- Now update users table
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;
        ALTER TABLE users DROP COLUMN id;
        ALTER TABLE users RENAME COLUMN id_varchar TO id;
        ALTER TABLE users ADD PRIMARY KEY (id);
        
        -- Recreate foreign keys
        ALTER TABLE projects 
          ADD CONSTRAINT projects_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id);
          
        ALTER TABLE project_likes 
          ADD CONSTRAINT project_likes_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id);
      END IF;
    END $$;
  `);
  
  console.log("Users table updated");
  console.log("Schema push complete!");
}

main()
  .then(() => {
    console.log("Database schema updated successfully");
    pool.end();
    process.exit(0);
  })
  .catch(error => {
    console.error("Error updating database schema:", error);
    pool.end();
    process.exit(1);
  });