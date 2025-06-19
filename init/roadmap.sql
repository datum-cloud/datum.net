-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    updated_at TIMESTAMP DEFAULT NOW(),
    content TEXT DEFAULT NULL
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id VARCHAR(24) UNIQUE NOT NULL,
    vote INTEGER DEFAULT 0
);
