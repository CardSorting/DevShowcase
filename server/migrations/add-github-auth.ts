import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Migration to add GitHub authentication fields to users table
 */
async function migrateGithubAuth() {
  try {
    console.log('Running migration to add GitHub auth fields...');
    
    // Add GitHub ID column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE IF EXISTS users
      ADD COLUMN IF NOT EXISTS github_id TEXT UNIQUE,
      ALTER COLUMN password DROP NOT NULL,
      ADD COLUMN IF NOT EXISTS display_name TEXT,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS email TEXT
    `);
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Execute the migration
migrateGithubAuth();