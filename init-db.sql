-- Create or update sessions table
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);

-- Update users table with new columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS first_name VARCHAR,
ADD COLUMN IF NOT EXISTS last_name VARCHAR,
ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Drop password column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- We'll need to run this script to fix any errors in the current database