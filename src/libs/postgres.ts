import type { Sql } from 'postgres';

let sql: Sql | null = null;

export interface IssuesProps {
  id: string;
  title: string;
  body: string;
  url: string;
  labels?: { nodes: Array<{ name: string }> };
  hasVoted?: boolean;
  updated_at: Date;
}

export interface VotesProps {
  id: string;
  vote: number;
  updated_at: Date;
}

export interface UserVotes {
  userId: string;
  issueId: number;
}

async function dbConnect() {
  if (!sql) {
    const postgres = (await import('postgres')).default;

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

async function getVotes(): Promise<VotesProps[]> {
  try {
    const sql = await dbConnect();
    const votes = await sql`SELECT * FROM votes`;
    return votes as unknown as VotesProps[];
  } catch {
    // error
    console.error('Error load votes from db');
    return [];
  }
}

async function getIssues(): Promise<IssuesProps[]> {
  try {
    const sql = await dbConnect();
    const issues = await sql`SELECT * FROM issues`;
    return issues as unknown as IssuesProps[];
  } catch {
    console.error('Error load issues from db');
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
  } catch {
    console.error(`Error load vote with id ${id} from db`);
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
  } catch {
    console.error('Error load user votes from db');
    return null;
  }
}

async function incrementVote(issueId: string, userId: string): Promise<boolean> {
  try {
    const sql = await dbConnect();
    const userVoted = await addUserVote(userId, issueId);

    if (!userVoted) {
      return false;
    }

    const result = await sql`
      INSERT INTO votes (id, vote, updated_at)
      VALUES (${issueId}, 1, ${new Date().toISOString()})
      ON CONFLICT (id) DO UPDATE SET vote = votes.vote + 1, updated_at = ${new Date().toISOString()}
      RETURNING *
    `;

    if (result.length < 1) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function decrementVote(issueId: string, userId: string): Promise<boolean> {
  try {
    const sql = await dbConnect();
    const userVoted = await removeUserVote(userId, issueId);

    if (!userVoted) {
      return false;
    }

    const result = await sql`
      UPDATE votes
      SET vote = CASE WHEN vote > 0 THEN vote - 1 ELSE 0 END, updated_at = ${new Date().toISOString()}
      WHERE id = ${issueId}
      RETURNING *
    `;

    if (result.length < 1) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function addUserVote(userId: string, issueId: string): Promise<boolean> {
  try {
    const sql = await dbConnect();
    const result = await sql`
    INSERT INTO user_votes (user_id, issue_id)
    VALUES (${userId}, ${issueId})
    RETURNING *
    `;

    if (result.length < 1) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function removeUserVote(userId: string, issueId: string): Promise<boolean> {
  try {
    const sql = await dbConnect();
    const result = await sql`
    DELETE FROM user_votes
    WHERE user_id = ${userId} AND issue_id = ${issueId}
    RETURNING *
    `;

    if (result.length < 1) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
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
  } catch {
    console.error('Error caching issues to db');
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
  decrementVote,
  refreshIssues,
  addUserVote,
  removeUserVote,
};
