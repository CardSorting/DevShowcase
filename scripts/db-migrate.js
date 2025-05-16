import fs from 'fs';
import { Pool } from '@neondatabase/serverless';
import path from 'path';
import { fileURLToPath } from 'url';

// Create a pool connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read SQL file
const sqlPath = path.join(__dirname, '../migrations/setup.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Run migration in a transaction
    await pool.query('BEGIN');
    
    // Split SQL into statements and execute them one by one
    const statements = sql
      .replace(/(\r\n|\n|\r)/gm, ' ') // Remove newlines
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .split(';') // Split on semicolons
      .map(s => s.trim())
      .filter(s => s.length > 0); // Remove empty statements
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await pool.query(statement);
    }
    
    await pool.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    // Don't close the pool as it might be used elsewhere
  }
}

runMigration();