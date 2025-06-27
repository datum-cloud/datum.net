import fs from 'fs';
import path from 'path';

const PROJECT_FILE_NAME = 'project.json';
const VOTE_FILE_NAME = 'vote.json';

export interface Projects {
  projects: object[];
  updated_at: Date;
}

export interface Votes {
  id: string;
  vote: number;
}

export async function getVotes(): Promise<Votes[]> {
  const dbLocation = '/app/.persistent/';
  const filePath = path.join(dbLocation, VOTE_FILE_NAME);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const votes: Votes[] = JSON.parse(fileContent).votes;

    if (votes) {
      return votes;
    }
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'ENOENT'
    ) {
      const defaultContent = JSON.stringify(
        { votes: [], updated_at: new Date().toISOString() },
        null,
        2
      );
      fs.writeFileSync(filePath, defaultContent, 'utf8');
    }
  }

  return [];
}

export async function getProjects(): Promise<Projects> {
  const dbLocation = '/app/.persistent/';
  const filePath = path.join(dbLocation, PROJECT_FILE_NAME);
  const defaultProjects = JSON.stringify(
    { projects: [], updated_at: new Date().toISOString() },
    null,
    2
  );

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const projects: Projects = JSON.parse(fileContent);

    if (projects) {
      return projects;
    }
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'ENOENT'
    ) {
      fs.writeFileSync(filePath, defaultProjects, 'utf8');
    }
  }

  return JSON.parse(defaultProjects);
  // try {
  //   const sql = await getDatabase();
  //   const projects = await sql`SELECT * FROM projects`;
  //   return projects as unknown as Projects[];
  // } catch (error) {
  //   console.error('Error fetching projects:', error);
  //   return [];
  // }
}

export async function getVote(id: string): Promise<Votes | null> {
  const dbLocation = '/app/.persistent/';
  const filePath = path.join(dbLocation, VOTE_FILE_NAME);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const votes: Votes[] = JSON.parse(fileContent).votes;
    if (votes) {
      return votes.find((vote) => vote.id === id) || null;
    } else {
      return null;
    }
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'ENOENT'
    ) {
      const defaultContent = JSON.stringify(
        { votes: [], updated_at: new Date().toISOString() },
        null,
        2
      );
      fs.writeFileSync(filePath, defaultContent, 'utf8');
    }
    return null;
  }

  // try {
  //   const sql = await getDatabase();
  //   const result = await sql`SELECT * FROM votes WHERE id = ${id}`;
  //   if (result.length === 0) {
  //     return null; // No vote found for the given ID
  //   }
  //   return result[0] as unknown as Votes;
  // } catch (error) {
  //   console.error('Error fetching vote:', error);
  //   return null;
  // }
}

export async function addVote(id: string): Promise<number | null> {
  const dbLocation = '/app/.persistent/';
  const filePath = path.join(dbLocation, VOTE_FILE_NAME);
  let newValue = 1;

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    const existingVoteIndex = data.votes.findIndex((vote: Votes) => vote.id === id);
    if (existingVoteIndex !== -1) {
      // Update existing vote
      newValue = data.votes[existingVoteIndex].vote + 1;
      data.votes[existingVoteIndex].vote = newValue;
    } else {
      // Create new vote
      data.votes.push({ id, vote: newValue });
    }

    data.updated_at = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return newValue;
  } catch (error) {
    console.error('Error setting vote:', error);
    return null;
  }
}

export async function updateProjects(projects: string): Promise<boolean> {
  const dbLocation = '/app/.persistent/';
  const filePath = path.join(dbLocation, PROJECT_FILE_NAME);
  const updated_at = new Date();

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    data.projects = JSON.parse(projects);
    data.updated_at = updated_at.toISOString();

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error updating projects:', error);
    return false;
  }

  // try {
  // } catch (error) {
  //   console.error('Error caching projects:', error);
  //   return false;
  // }
  // try {
  //   const sql = await getDatabase();
  //   await sql`TRUNCATE TABLE projects RESTART IDENTITY`;
  //   await sql`INSERT INTO projects (content, updated_at) VALUES (${projects}, ${updated_at}) RETURNING *`;

  //   return true;
  // } catch (error) {
  //   console.error('Error caching projects:', error);
  //   return false;
  // }
  // return false;
}
