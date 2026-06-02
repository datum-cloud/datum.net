import type { Sql } from 'postgres';

let sql: Sql | null = null;

async function dbConnect() {
  if (!sql) {
    const postgres = (await import('postgres')).default;

    const USER = process.env.POSTGRES_USER || import.meta.env.POSTGRES_USER;
    const PASSWORD = process.env.POSTGRES_PASSWORD || import.meta.env.POSTGRES_PASSWORD;
    const HOST = process.env.POSTGRES_HOST || import.meta.env.POSTGRES_HOST;
    const PORT = process.env.POSTGRES_PORT || import.meta.env.POSTGRES_PORT || 5432;
    const DB = process.env.POSTGRES_DB || import.meta.env.POSTGRES_DB;
    const connectionString = `postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB}`;

    if (!connectionString) {
      throw new Error('Database environment variable is required');
    }

    sql = postgres(connectionString, {
      user: USER,
      password: PASSWORD,
      host: HOST,
      port: PORT,
      database: DB,
      max: 10,
      idle_timeout: 30,
      connect_timeout: 2,
    });
  }

  return sql;
}

export { dbConnect };
