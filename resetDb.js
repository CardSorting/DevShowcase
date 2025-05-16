import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetSchema() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Drop existing tables
    console.log('Dropping existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS project_likes CASCADE;
      DROP TABLE IF EXISTS project_views CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
    `);

    // Create sessions table
    console.log('Creating sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR(255) PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
    `);

    // Create users table
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        profile_image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create projects table
    console.log('Creating projects table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id),
        username TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        project_url TEXT NOT NULL,
        preview_url TEXT NOT NULL,
        thumbnail_url TEXT,
        zip_path TEXT NOT NULL,
        views INTEGER NOT NULL DEFAULT 0,
        likes INTEGER NOT NULL DEFAULT 0,
        featured BOOLEAN NOT NULL DEFAULT false,
        trending BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create project_views table
    console.log('Creating project_views table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_views (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id),
        visitor_id TEXT NOT NULL,
        viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create project_likes table
    console.log('Creating project_likes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_likes (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id),
        user_id VARCHAR(255) REFERENCES users(id),
        visitor_id TEXT,
        liked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Database schema reset successful!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error resetting schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the schema reset function
resetSchema();