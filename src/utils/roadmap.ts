import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { graphql } from '@octokit/graphql';
import { saveJson, loadJson } from './file';

const DB_LOCATION = '/app/.persistent/';
const ISSUE_FILE_NAME = 'issue.json';
const VOTE_FILE_NAME = 'vote.json';
const USER_VOTE_FILE_NAME = 'user_vote.json';

export interface Issues {
  issues: typeof getProjects;
  updated_at: Date;
}

export interface Projects {
  issues: object[];
  updated_at: Date;
}

export interface Votes {
  [key: string]: number;
}

export interface UserVote {
  [key: string]: string[];
}

type GitHubGraphQLResponse = {
  data: {
    repository: {
      issues: {
        nodes: [
          {
            id: string;
            title: string;
            body: string;
            url: string;
            labels: {
              nodes: Array<{
                name: string;
              }>;
            };
          },
        ];
      };
    };
  };
};

async function getRoadmap() {
  let issues: object[] = [];

  try {
    const projectData: Projects = await getProjects();

    if (projectData && projectData.issues.length > 0) {
      if (isOverOneHourAgo(projectData.updated_at)) {
        issues = await issuesLabeledRoadmap();
        await updateProjects(JSON.stringify(issues));
      } else {
        issues = projectData.issues;
      }
    } else {
      issues = await issuesLabeledRoadmap();
      await updateProjects(JSON.stringify(issues));
    }
  } catch (error) {
    console.error(
      'Fetching issues from the remote & db failed: ',
      error instanceof Error ? error.message : String(error)
    );
  }

  return assignVoteValueToIssue(issues);
}

async function getVoted(id: string): Promise<string[] | null> {
  try {
    const userVotes: UserVote = (await loadJson(USER_VOTE_FILE_NAME)) as UserVote;
    const userVote = userVotes[id] || null;

    if (!userVote) {
      return null; // User has not voted
    } else {
      return userVote;
    }
  } catch (error) {
    // User has not voted
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'ENOENT'
    ) {
      return null;
    } else {
      return null;
    }
  }
}

async function getVotes(): Promise<Votes> {
  try {
    const fileContent = (await loadJson(VOTE_FILE_NAME)) as { votes: Votes };
    const votes: Votes = fileContent.votes;

    return votes;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'ENOENT'
    ) {
      createDefaultVoteFile();
    }
  }

  return {};
}

/** Adds a vote for a specific vote ID by a user.
 * If the user has not voted yet, it increments the vote count and returns the new vote count.
 * If the user has already voted, it returns null.
 * @param voteId - The ID of the vote
 * @param userId - The ID of the user
 * @returns {Promise<number | null>} - Returns the new vote count if the user has not voted yet, or null if the user has already voted
 */
async function addVote(voteId: string, userId: string): Promise<number | null> {
  const votesData: Votes = await getVotes();
  let newValue = 1;

  try {
    if (await setUserVoteLog(userId, voteId)) {
      // If the user has already voted, we increment the vote count
      if (!votesData || Object.keys(votesData).length < 1) {
        // If the user has not voted yet, we add a new vote entry
        saveJson(VOTE_FILE_NAME, {
          votes: { [voteId]: newValue },
          updated_at: new Date().toISOString(),
        });
      } else {
        if (voteId in votesData) {
          newValue = votesData[voteId] + 1;
          votesData[voteId] = newValue;
          saveJson(VOTE_FILE_NAME, { votes: votesData, updated_at: new Date().toISOString() });
        } else {
          votesData[voteId] = newValue;
          saveJson(VOTE_FILE_NAME, { votes: votesData, updated_at: new Date().toISOString() });
        }
      }
      return newValue;
    }

    return null;
  } catch (error) {
    console.error('Error setting vote:', error);
    return null;
  }
}

async function getProjects(): Promise<Projects> {
  const defaultProjects = JSON.stringify(
    { issues: [], updated_at: new Date().toISOString() },
    null,
    2
  );

  try {
    // const fileContent = fs.readFileSync(filePath, 'utf8');
    // const projects: Projects = JSON.parse(fileContent);
    const projects: Projects = (await loadJson(ISSUE_FILE_NAME)) as Projects;

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
      createDefaultIssueFile();
    }
  }

  return JSON.parse(defaultProjects);
}

async function updateProjects(issues: string): Promise<boolean> {
  const filePath = path.join(DB_LOCATION, ISSUE_FILE_NAME);
  const updated_at = new Date();

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    data.issues = JSON.parse(issues);
    data.updated_at = updated_at.toISOString();

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error updating projects:', error);
    return false;
  }
}

async function setUserVoteLog(userId: string, voteId: string): Promise<boolean> {
  try {
    const userVotes: UserVote = (await loadJson(USER_VOTE_FILE_NAME)) as UserVote;

    if (!userVotes[userId]) {
      saveJson(USER_VOTE_FILE_NAME, { [userId]: [voteId] });
      return true;
    }

    if (!userVotes[userId].includes(voteId)) {
      userVotes[userId].push(voteId);
      saveJson(USER_VOTE_FILE_NAME, userVotes);
      return true;
    }

    return false; // User has already voted, no need to update
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'ENOENT'
    ) {
      saveJson(USER_VOTE_FILE_NAME, { [userId]: [voteId] });
      return true;
    } else {
      return false;
    }
  }
}

function isOverOneHourAgo(date: Date): boolean {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  return date < oneHourAgo;
}

async function issuesLabeledRoadmap(): Promise<object[]> {
  const token = import.meta.env.GH_ACCESS_TOKEN || process.env.GH_ACCESS_TOKEN;

  if (!token) {
    throw new Error('GH_ACCESS_TOKEN must be set');
  }

  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const jsonData: GitHubGraphQLResponse = await graphqlWithAuth(
    `
      query {
        repository(owner: "datum-cloud", name: "enhancements") {
          issues(last: 50, filterBy: {states: OPEN, labels: ["milo"]}) {
            nodes {
              id
              title
              body
              url
            }
          }
        }
      }
    `
  );

  return Object(jsonData).repository.issues.nodes;
}

async function assignVoteValueToIssue(source: object): Promise<object[]> {
  const newIssues: object[] = [];
  let votesMap = new Map();

  // add vote to projects
  try {
    const votes = await getVotes();
    votesMap = new Map(Object.entries(votes));
  } catch (error) {
    console.error(
      'Fetching votes from the remote and db failed: ',
      error instanceof Error ? error.message : String(error)
    );
  }

  if (!Array.isArray(source)) {
    throw new TypeError('Expected source to be an array');
  }

  for (const issue of source) {
    const issueId = issue.id;
    const issueVote = votesMap.get(issueId) || null;
    const modifyProject = {
      content: {
        id: issue.id,
        title: issue.title,
        body: issue.body ? marked.parse(issue.body) : '',
        url: issue.url,
        labels: issue.labels,
      },
    };

    if (issueVote) {
      newIssues.push({
        ...modifyProject,
        vote: issueVote,
      });
    } else {
      newIssues.push({
        ...modifyProject,
        vote: 0, // Default vote count if not found in votes
      });
    }
  }

  return newIssues;
}

/** Creates a default file with an empty default values. **/
function createDefaultIssueFile(): boolean {
  const defaultValue = { issues: [], updated_at: new Date().toISOString() };
  saveJson(ISSUE_FILE_NAME, defaultValue);
  return true;
}

function createDefaultVoteFile(): object {
  const defaultValue = { votes: [], updated_at: new Date().toISOString() };
  saveJson(VOTE_FILE_NAME, defaultValue);
  return defaultValue;
}

export { getRoadmap, getProjects, updateProjects, addVote, getVotes, getVoted };
