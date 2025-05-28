import { db, ProjectVotes } from 'astro:db';
import { marked } from 'marked';

type GitHubGraphQLResponse = {
  data: {
    organization: {
      projectV2: {
        items: {
          nodes: any[];
        };
      };
    };
  };
  [key: string]: any;
};

// TODO: use the real GitHub GraphQL API endpoint
const graphQL = async (token: string, query: string): Promise<GitHubGraphQLResponse> => {
  const api_url = 'http://localhost:4321/roadmap.json'; // 'https://api.github.com/graphql';
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  console.log('Query:', query);
  const response = await fetch(api_url, {
    method: 'GET',
    headers: headers,
    // body: JSON.stringify({ query }),
  });

  const responseData = await response.json();
  return responseData;
};

async function normalizeData(source: object): Promise<object[]> {
  const newProjects: object[] = [];

  // add vote to projects
  const votes = await db.select().from(ProjectVotes);
  const votesMap = new Map(votes.map((vote) => [vote.id, vote]));

  if (!Array.isArray(source)) {
    throw new TypeError('Expected source to be an array');
  }

  for (const project of source) {
    const projectId = project.content.id;
    const projectVote = votesMap.get(projectId);

    const modifyProject = {
      content: {
        id: project.content.id,
        title: project.content.title,
        body: marked.parse(project.content.body),
        url: project.content.url,
        labels: project.content.labels,
      },
    };

    if (projectVote) {
      newProjects.push({
        ...modifyProject,
        vote: projectVote.vote,
      });
    } else {
      newProjects.push({
        ...modifyProject,
        vote: 0,
      });
    }
  }

  // console.log(newProjects);
  return newProjects;
}

async function getProjects(): Promise<object[]> {
  const token = import.meta.env.GITHUB_TOKEN;
  const jsonData: GitHubGraphQLResponse = await graphQL(
    token,
    `
    query {
      organization(login: "datum-cloud") {
        projectV2(number: 2) {
          items(first: 10) {
            nodes {
              content {
                ... on Issue  {
                  databaseId
                  id
                  title
                  body
                  url
                  labels {
                    nodes{
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `
  );

  // TODO: handle errors and check if jsonData is valid
  const projects = jsonData.data.organization.projectV2.items.nodes;

  // TODO: filter projects by labels

  return normalizeData(projects);
}

export { getProjects };
