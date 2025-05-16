import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import * as schema from "./shared/schema";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Pushing schema changes...");
  // This is a simple approach to create tables that don't exist yet
  const result = await db.execute(`
    -- Create sessions table if it doesn't exist
    CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
    
    -- Alter users table to match new schema
    ALTER TABLE users 
    DROP COLUMN IF EXISTS password;
    
    -- Add new columns to users table
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS email VARCHAR UNIQUE,
    ADD COLUMN IF NOT EXISTS first_name VARCHAR,
    ADD COLUMN IF NOT EXISTS last_name VARCHAR,
    ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    
    -- Change id column type from serial to varchar in users table
    ALTER TABLE users ALTER COLUMN id TYPE VARCHAR USING id::VARCHAR;
    
    -- Change user_id references in other tables
    ALTER TABLE projects ALTER COLUMN user_id TYPE VARCHAR USING user_id::VARCHAR;
    ALTER TABLE project_likes ALTER COLUMN user_id TYPE VARCHAR USING user_id::VARCHAR;
  `);
  
  console.log("Schema changes applied successfully!");
  console.log(result);
  
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to apply schema changes:", err);
  process.exit(1);
});