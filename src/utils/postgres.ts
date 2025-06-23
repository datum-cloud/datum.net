import type { Sql } from 'postgres';

let sql: Sql | null = null;

export async function getDatabase() {
  if (!sql) {
    const postgres = (await import('postgres')).default;

    // const connectionString = process.env.DATABASE_URL;
    // if (!connectionString) {
    //   throw new Error('DATABASE_URL environment variable is required');
    // }

    sql = postgres({
      host: 'postgres',
      port: 5432,
      database: import.meta.env.POSTGRES_DB || process.env.POSTGRES_DB,
      user: import.meta.env.POSTGRES_USER || process.env.POSTGRES_USER,
      password: import.meta.env.POSTGRES_PASSWORD || process.env.POSTGRES_PASSWORD,
      max: 10,
      idle_timeout: 30,
      connect_timeout: 2,
    });
  }

  return sql;
}

export interface Projects {
  id: number;
  updated_at: Date;
  content: string;
}

export interface Votes {
  id: string;
  vote: number;
}

export async function getVotes(): Promise<Votes[]> {
  try {
    const sql = await getDatabase();
    const votes = await sql`SELECT * FROM votes`;
    return votes as unknown as Votes[];
  } catch (error) {
    console.error('Error fetching votes:', error);
    return [];
  }
}

export async function getProjects(): Promise<Projects[]> {
  try {
    const sql = await getDatabase();
    const projects = await sql`SELECT * FROM projects`;
    return projects as unknown as Projects[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getVote(id: string): Promise<Votes | null> {
  try {
    const sql = await getDatabase();
    const result = await sql`SELECT * FROM votes WHERE id = ${id}`;
    if (result.length === 0) {
      return null;
    }

    return result[0] as Votes;
  } catch (error) {
    console.error('Error fetching vote:', error);
    return null;
  }
}

export async function setVote(id: string, value: number): Promise<Votes | null> {
  try {
    const sql = await getDatabase();
    const result = await sql`
      INSERT INTO votes (id, vote)
      VALUES (${id}, ${value})
      ON CONFLICT (id) DO UPDATE SET vote = ${value}
      RETURNING *
    `;

    if (result.length === 0) {
      return null;
    }

    return result[0] as Votes;
  } catch (error) {
    console.error('Error creating vote:', error);
    return null;
  }
}

export async function refreshProjects(projects: string, updated_at: Date): Promise<boolean> {
  try {
    const sql = await getDatabase();
    await sql`TRUNCATE TABLE projects RESTART IDENTITY`;
    await sql`INSERT INTO projects (content, updated_at) VALUES (${projects}, ${updated_at}) RETURNING *`;

    return true;
  } catch (error) {
    console.error('Error caching projects:', error);
    return false;
  }
}
