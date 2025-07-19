import type { Sql } from 'postgres';

let sql: Sql | null = null;

async function dbConnect() {
  if (!sql) {
    const postgres = (await import('postgres')).default;

    // postgres://datum:datum@postgresql:5432/datum_net
    const USER = import.meta.env.POSTGRES_USER || process.env.POSTGRES_USER;
    const PASSWORD = import.meta.env.POSTGRES_PASSWORD || process.env.POSTGRES_PASSWORD;
    const HOST = import.meta.env.POSTGRES_HOST || process.env.POSTGRES_HOST;
    const PORT = import.meta.env.POSTGRES_PORT || process.env.POSTGRES_PORT || 5432;
    const DB = import.meta.env.POSTGRES_DB || process.env.POSTGRES_DB;
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

export interface Issues {
  id: string;
  title: string;
  body: string;
  url: string;
  updated_at: Date;
}

export interface Votes {
  id: string;
  vote: number;
  updated_at: Date;
}

export interface UserVotes {
  userId: string;
  issueId: number;
}

async function getVotes(): Promise<Votes[]> {
  try {
    const sql = await dbConnect();
    const votes = await sql`SELECT * FROM votes`;
    return votes as unknown as Votes[];
  } catch (error) {
    console.error('Error fetching votes:', error);
    return [];
  }
}

async function getIssues(): Promise<Issues[]> {
  try {
    const sql = await dbConnect();
    const issues = await sql`SELECT * FROM issues`;
    return issues as unknown as Issues[];
  } catch (error) {
    console.error('Error fetching issues:', error);
    return [];
  }
}

async function getVote(id: string): Promise<number | null> {
  try {
    const sql = await dbConnect();
    const result = await sql`SELECT vote FROM votes WHERE id = ${id}`;
    if (result.length === 0) {
      return null;
    }

    return result[0].vote as number;
  } catch (error) {
    console.error(`Error fetching vote with id ${id}: `, error);
    return null;
  }
}

async function getUserVoted(userId: string): Promise<string[] | null> {
  try {
    const sql = await dbConnect();

    const result = await sql`
      SELECT issue_id FROM user_votes WHERE user_id = ${userId}
    `;

    if (result.length === 0) {
      return null;
    }

    return result.map((row) => row.issue_id);
  } catch (error) {
    console.error('Error fetching user votes:', error);
    return null;
  }
}

async function incrementVote(issueId: string, userId: string): Promise<object | null> {
  try {
    const sql = await dbConnect();

    // If the vote does not exist, create a new one with a vote of 1
    const result = await sql`
      INSERT INTO votes (id, vote, updated_at)
      VALUES (${issueId}, 1, ${new Date().toISOString()})
      ON CONFLICT (id) DO UPDATE SET vote = votes.vote + 1, updated_at = ${new Date().toISOString()}
      RETURNING vote
    `;
    if (result.length === 0) {
      return null;
    }

    const log = await addUserVote(userId, issueId);

    return {
      count: result[0].vote as number,
      log,
    };
  } catch {
    return null;
  }
}

async function addUserVote(userId: string, issueId: string): Promise<string[] | null> {
  try {
    const sql = await dbConnect();
    const result = await sql`
    INSERT INTO user_votes (user_id, issue_id)
    VALUES (${userId}, ${issueId})
    RETURNING user_id, issue_id
    `;

    if (result.length === 0) {
      return null;
    }

    return await getUserVoted(userId);
  } catch (error) {
    console.error('Error creating user vote:', error);
  }

  return null;
}

async function refreshIssues(issues: object): Promise<boolean> {
  const updated_at = new Date().toISOString();

  try {
    const sql = await dbConnect();
    await sql`TRUNCATE TABLE issues RESTART IDENTITY`;

    if (!Array.isArray(issues)) {
      throw new Error('Source must be an array of issues');
    }

    for (const issue of issues) {
      if (typeof issue !== 'object' || !issue.id || !issue.title || !issue.url) {
        throw new TypeError('Each issue must be an object with id and url');
      }
      // Ensure issue has the required properties
      if (!issue.body) {
        issue.body = '';
      }

      // Insert each issue into the database
      await sql`INSERT INTO issues (id, title, body, url, updated_at) VALUES (${issue.id}, ${issue.title}, ${issue.body}, ${issue.url}, ${updated_at})`;
    }

    return true;
  } catch (error) {
    console.error('Error caching issues:', error);
    return false;
  }
}

export {
  dbConnect,
  getVotes,
  getUserVoted,
  getIssues,
  getVote,
  incrementVote,
  refreshIssues,
  addUserVote,
};
