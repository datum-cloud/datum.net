import { marked } from 'marked';
import { graphql } from '@octokit/graphql';
import {
  refreshIssues,
  getUserVoted as userVoted,
  getIssues,
  addUserVote,
  incrementVote,
  getVotes,
} from '@libs/postgres';
import type { Issues } from '@libs/postgres';

type GitHubGraphQLResponse = {
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

async function getRoadmap() {
  let issues: Issues[] = await getIssues();

  try {
    if (issues && issues.length > 0) {
      if (isOverOneHourAgo(issues[0].updated_at)) {
        // take the first issue's updated_at date to check if it's over one hour ago
        issues = await getIssuesFromGithub();
        await refreshIssues(issues);
      }
    } else {
      issues = await getIssuesFromGithub();
      await refreshIssues(issues);
    }
  } catch (error) {
    console.error(
      'Fetching issues from the remote & db failed: ',
      error instanceof Error ? error.message : String(error)
    );
  }

  return assignVoteValueToIssue(issues);
}

async function getUserVoted(userId: string): Promise<object> {
  try {
    const userVote = await userVoted(userId);
    if (!userVote) {
      return []; // User has not voted
    } else {
      return userVote;
    }
  } catch {
    return [];
  }
}

async function addVote(issueId: string, userId: string): Promise<number | null> {
  let newValue = null;

  try {
    addUserVote(userId, issueId).then((userVotes) => {
      if (userVotes) {
        newValue = incrementVote(issueId, userId);
      }
    });

    return newValue;
  } catch (error) {
    console.error('Error setting vote:', error);
    return null;
  }
}

function isOverOneHourAgo(date: Date): boolean {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  return date < oneHourAgo;
}

async function graphqlWithAppAuth() {
  const appId = import.meta.env.APP_ID || process.env.APP_ID;
  const privateKey = import.meta.env.APP_PRIVATE_KEY || process.env.APP_PRIVATE_KEY;
  const installationId = parseInt(
    import.meta.env.APP_INSTALLATION_ID || process.env.APP_INSTALLATION_ID,
    10
  );

  if (!appId || isNaN(installationId)) {
    throw new Error('APP_ID and APP_INSTALLATION_ID must be set');
  }

  if (!privateKey) {
    throw new Error('missing app private key');
  }

  // Permissions: Read access to actions, actions variables, code, codespaces, codespaces metadata, deployments, discussions, issues, merge queues, metadata, pages, pull requests, secret scanning alerts, and secrets
  const { createAppAuth } = await import('@octokit/auth-app');

  const auth = createAppAuth({
    appId,
    privateKey,
    installationId,
  });

  return graphql.defaults({
    request: {
      hook: auth.hook,
    },
  });
}

async function getIssuesFromGithub(): Promise<Issues[]> {
  const labelFilter = import.meta.env.ROADMAP_LABEL || process.env.ROADMAP_LABEL;
  const graphqlWithAuth = await graphqlWithAppAuth();
  const jsonData: GitHubGraphQLResponse = await graphqlWithAuth(
    `
      query {
        repository(owner: "datum-cloud", name: "enhancements") {
          issues(last: 50, filterBy: {states: OPEN, labels: ["${labelFilter}"]}) {
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

  const issues: Issues[] = Object(jsonData.repository.issues.nodes).map((issue: Issues) => ({
    ...issue,
  }));

  return issues;
}

async function assignVoteValueToIssue(source: object): Promise<object[]> {
  const newIssues: object[] = [];
  let votesMap = new Map();

  try {
    const votes = await getVotes();
    votesMap = new Map(votes.map((vote) => [vote.id, vote.vote]));
  } catch (error) {
    console.error(
      'Fetching votes from the db failed: ',
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
      id: issue.id,
      title: issue.title,
      body: issue.body ? marked.parse(issue.body) : '',
      url: issue.url,
      labels: issue.labels,
    };

    if (issueVote) {
      newIssues.push({
        ...modifyProject,
        vote: issueVote,
      });
    } else {
      newIssues.push({
        ...modifyProject,
        vote: 0,
      });
    }
  }

  return newIssues;
}

export { getRoadmap, addVote, getUserVoted };
