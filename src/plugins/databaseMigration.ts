import { dbConnect } from '../libs/postgres';
import type { AstroIntegration } from 'astro';

/**
 * Database migration integration for Astro
 */
async function migrateDatabase() {
  try {
    const POSTGRES_USER = process.env.POSTGRES_USER;
    const sql = await dbConnect();
    // check if table exists
    const table = await sql`SELECT to_regclass('public.issues') as table_exists;`;

    if (table[0].table_exists) {
      console.log('DB Init: Database already initialized');
    } else {
      if (POSTGRES_USER) {
        // Initialize tables
        await sql`
            CREATE TABLE IF NOT EXISTS issues (
              id VARCHAR(32) PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              body TEXT NOT NULL,
              url VARCHAR(255) NOT NULL,
              updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS votes (
              id VARCHAR(32) UNIQUE NOT NULL,
              vote INTEGER DEFAULT 0,
              updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS user_votes (
              user_id VARCHAR(64) NOT NULL,
              issue_id VARCHAR(32) NOT NULL,
              CONSTRAINT user_issue UNIQUE (user_id,issue_id)
            );

            ALTER TABLE issues OWNER TO ${POSTGRES_USER};
            ALTER TABLE votes OWNER TO ${POSTGRES_USER};
            ALTER TABLE user_votes OWNER TO ${POSTGRES_USER};`;
      }
    }
    console.log('DB Init: Database initialization completed');
  } catch {
    console.log('DB Init: Database initialization failed');
  }
}

export default function databaseMigration(): AstroIntegration {
  return {
    name: 'database-migration',
    hooks: {
      'astro:build:done': async () => {
        await migrateDatabase();
      },
    },
  };
}
