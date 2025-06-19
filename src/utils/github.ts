// import { db, Votes, Project } from 'astro:db';
import { refreshProjects, getProjects, getVotes } from '@/src/utils/roadmap';
import { marked } from 'marked';
import { graphql } from '@octokit/graphql';

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

function isOverOneHourAgo(date: Date): boolean {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  return date < oneHourAgo;
}

// /**
//  * Fetches the roadmap from the database or GitHub GraphQL API (Enhancements (projectNumber: 22)).
//  * If the projects are already in the database and were updated more than one hour ago, it fetches them from GitHub.
//  * Otherwise, it retrieves the projects from the database or fetches them from GitHub if they don't exist.
//  *
//  * @returns A promise that resolves to an array of project objects
//  */
async function getRoadmap() {
  let issues: object[] = [];

  try {
    // console.log('-------- Fetching roadmap from the database');
    const currentIssues = await getProjects();

    if (currentIssues && currentIssues.length > 0) {
      if (isOverOneHourAgo(currentIssues[0].updated_at)) {
        issues = await issuesLabeledRoadmap();
        // console.log('======== Update data to database from GitHub GraphQL API');
        await refreshProjects(JSON.stringify(issues), new Date());
      } else {
        // console.log('-------- Using existing issues from the database');
        issues = JSON.parse(currentIssues[0].content);
      }
    } else {
      // console.log('-------- No issues in the database');
      issues = await issuesLabeledRoadmap();
      // console.log('======== Update data to database from GitHub GraphQL API');
      await refreshProjects(JSON.stringify(issues), new Date());
    }
  } catch (error) {
    console.error('-------- Error fetching roadmap:', error);
    issues = await issuesLabeledRoadmap();
  }

  return addVoteToIssue(issues);
}

async function issuesLabeledRoadmap(): Promise<object[]> {
  // console.log('======== Fetching issues labeled "Roadmap Vote" from GitHub GraphQL API');
  const token = import.meta.env.GH_ACCESS_TOKEN || process.env.GH_ACCESS_TOKEN;

  if (!token) {
    throw new Error('GH_ACCESS_TOKEN must be set');
  }

  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  // filterBy: {states: OPEN, labels: ["Roadmap Vote"]}
  const jsonData: GitHubGraphQLResponse = await graphqlWithAuth(
    `
      query {
        repository(owner: "datum-cloud", name: "enhancements") {
          issues(last: 50, filterBy: {states: OPEN, labels: ["Milo"]}) {
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

async function addVoteToIssue(source: object): Promise<object[]> {
  const newIssues: object[] = [];
  let votesMap = new Map();

  // add vote to projects
  try {
    const votes = await getVotes();
    // console.log('-------- Votes fetched from the database:', votes);
    votesMap = new Map(votes.map((vote) => [vote.id, vote]));
  } catch (error) {
    console.error(
      '==== Fetching votes from the remote:',
      error instanceof Error ? error.message : String(error)
    );
  }

  if (!Array.isArray(source)) {
    throw new TypeError('Expected source to be an array');
  }

  for (const issue of source) {
    const issueId = issue.id;
    const issueVote = votesMap.get(issueId);

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
        vote: issueVote.vote,
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

export { getRoadmap };
