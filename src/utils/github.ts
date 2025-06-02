import { db, ProjectVotes, Project } from 'astro:db';
import { marked } from 'marked';
import { graphql } from '@octokit/graphql';

type GitHubGraphQLResponse = {
  data: {
    search: {
      edges: [
        {
          node: {
            content: {
              id: string;
              databaseId: string;
              title: string;
              body: string;
              url: string;
              labels: {
                nodes: Array<{
                  name: string;
                }>;
              };
            };
          };
        },
      ];
    };
  };
};

function isOverOneHourAgo(date: Date): boolean {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  return date < oneHourAgo;
}

/**
 * Fetches the roadmap from the database or GitHub GraphQL API (Enhancements (projectNumber: 22)).
 * If the projects are already in the database and were updated more than one hour ago, it fetches them from GitHub.
 * Otherwise, it retrieves the projects from the database or fetches them from GitHub if they don't exist.
 *
 * @returns A promise that resolves to an array of project objects
 */
async function getRoadmap() {
  const currentIssues = await db.select().from(Project);

  let issues: object[] = [];

  if (currentIssues.length > 0) {
    if (isOverOneHourAgo(currentIssues[0].updated_at)) {
      // console.log('Over a hour ago, fetching issues from GitHub GraphQL API');
      issues = await issuesLabeledRoadmap();
      await db.delete(Project);
      await db.insert(Project).values({ updated_at: new Date(), data: JSON.stringify(issues) });
    } else {
      // console.log('Using existing issues from the database');
      issues = JSON.parse(currentIssues[0].data);
    }
  } else {
    // console.log('No issues in the database, fetching from GitHub GraphQL API');
    issues = await issuesLabeledRoadmap();
    await db.delete(Project);
    await db.insert(Project).values({ updated_at: new Date(), data: JSON.stringify(issues) });
  }

  return issues;
}

async function normalizeIssues(source: object): Promise<object[]> {
  const newIssues: object[] = [];

  // add vote to projects
  const votes = await db.select().from(ProjectVotes);
  const votesMap = new Map(votes.map((vote) => [vote.id, vote]));

  if (!Array.isArray(source)) {
    throw new TypeError('Expected source to be an array');
  }

  for (const issue of source) {
    const issueId = issue.node.id;
    const issueVote = votesMap.get(issueId);

    const modifyProject = {
      content: {
        id: issue.node.id,
        title: issue.node.title,
        body: issue.node.body ? marked.parse(issue.node.body) : '',
        url: issue.node.url,
        labels: issue.node.labels,
      },
    };

    if (issueVote) {
      newIssues.push({
        ...modifyProject,
        vote: issueVote.vote,
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

async function issuesLabeledRoadmap(): Promise<object[]> {
  const appId = import.meta.env.APP_ID ?? process.env.APP_ID;
  const privateKey = import.meta.env.APP_PRIVATE_KEY ?? process.env.APP_PRIVATE_KEY;
  const installationId = parseInt(
    import.meta.env.APP_INSTALLATION_ID ?? process.env.APP_INSTALLATION_ID,
    10
  );

  if (!appId || !privateKey || isNaN(installationId)) {
    throw new Error('APP_ID, APP_PRIVATE_KEY, and APP_INSTALLATION_ID must be set');
  }

  const { createAppAuth } = await import('@octokit/auth-app');
  const auth = createAppAuth({
    appId,
    privateKey,
    installationId,
  });
  const graphqlWithAuth = graphql.defaults({
    request: {
      hook: auth.hook,
    },
  });

  const jsonData: GitHubGraphQLResponse = await graphqlWithAuth(
    `
      query {
        search(type: ISSUE, first: 10, query:"repo:datum-cloud/enhancements state:open label:\\"Roadmap Vote\\""){
          edges {
            node {
              ... on Issue {
                id
                title
                body
                url
                labels (first: 10) {
                  nodes {
                    name
                  }
                }
              }
            }
          }
        }
      }
    `
  );

  return normalizeIssues(Object(jsonData).search.edges);
}

export { getRoadmap };
