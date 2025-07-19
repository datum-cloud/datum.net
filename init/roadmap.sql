CREATE DATABASE mydatabase;

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
    id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    url VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id VARCHAR(32) UNIQUE NOT NULL,
    vote INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_vote table
CREATE TABLE IF NOT EXISTS user_votes (
    user_id VARCHAR(64) NOT NULL,
    issue_id VARCHAR(32) NOT NULL,
    CONSTRAINT user_issue UNIQUE (user_id,issue_id)
);
