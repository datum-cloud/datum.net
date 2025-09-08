import { marked } from 'marked';
import { graphql } from '@octokit/graphql';
import {
  dbConnect,
  addUserVote,
  removeUserVote,
  refreshIssues,
  getUserVoted as userVoted,
  getIssues,
  incrementVote,
  getVotes,
} from '@libs/postgres';
import type { IssuesProps } from '@libs/postgres';

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

function isConnectedToDB(): boolean {
  try {
    const sql = dbConnect();
    return !!sql;
  } catch {
    return false;
  }
}

function isOverOneHourAgo(date: Date): boolean {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  return date < oneHourAgo;
}

async function getRoadmap(userId: string | null) {
  let issues: IssuesProps[] = await getIssues();

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

  return assignAdditionalDataToIssue(issues, userId);
}

async function graphqlWithAppAuth(appId: number, installationId: number, privateKey: string) {
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

async function getIssuesFromGithub(): Promise<IssuesProps[]> {
  const appId = import.meta.env.APP_ID || process.env.APP_ID;
  const privateKey = import.meta.env.APP_PRIVATE_KEY || process.env.APP_PRIVATE_KEY;
  const installationId = parseInt(
    import.meta.env.APP_INSTALLATION_ID || process.env.APP_INSTALLATION_ID || '0',
    10
  );

  if (!appId || !installationId || !privateKey) {
    return [];
  }

  const filters = import.meta.env.ROADMAP_LABEL || process.env.ROADMAP_LABEL || 'Cloud Portal';
  const labelFilter = filters
    .split(',')
    .map((label: string) => `"${label.trim()}"`)
    .join(',');

  const graphqlWithAuth = await graphqlWithAppAuth(
    Number(appId),
    Number(installationId),
    privateKey
  );

  const jsonData: GitHubGraphQLResponse = await graphqlWithAuth(
    `
      query {
        repository(owner: "datum-cloud", name: "enhancements") {
          issues(last: 50, filterBy: {states: OPEN, labels: [${labelFilter}]}) {
            nodes {
              id
              title
              body
              url
              labels(first: 10) {
                nodes {
                  name
                }
              }
            }
          }
        }
      }
    `
  );
  // console.log('----- Fetched issues from GitHub:', jsonData.repository.issues.nodes);
  const issues: IssuesProps[] = Object(jsonData.repository.issues.nodes).map(
    (issue: IssuesProps) => ({
      ...issue,
    })
  );

  return issues;
}

async function assignAdditionalDataToIssue(
  source: object,
  userId: string | null
): Promise<object[]> {
  const newIssues: object[] = [];
  let votesMap = new Map();

  const userVotedIssues = userId ? await getUserVoted(userId) : [];
  // console.log(`+++++ userVotedIssues: ${JSON.stringify(userVotedIssues)}`);

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

    const userHasVoted = (userVotedIssues as string[]).some((vote) => vote === issueId);

    if (issueVote) {
      newIssues.push({
        ...modifyProject,
        vote: issueVote,
        hasVoted: userHasVoted,
      });
    } else {
      newIssues.push({
        ...modifyProject,
        vote: 0,
        hasVoted: userHasVoted,
      });
    }
  }

  return newIssues;
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

async function removeVote(issueId: string, userId: string): Promise<number | null> {
  let newValue = null;

  try {
    removeUserVote(userId, issueId).then((userVotes) => {
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

export { getRoadmap, addVote, getUserVoted, removeVote, isConnectedToDB };
