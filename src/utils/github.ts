import { graphql } from '@octokit/graphql';

type GitHubGraphQLResponse = {
  repository: {
    stargazerCount: number;
  };
};

async function graphqlWithAppAuth(appId: number, installationId: number, privateKey: string) {
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

async function stargazerCount(owner: string, name: string): Promise<number> {
  const appId = import.meta.env.APP_ID || process.env.APP_ID;
  const privateKey = import.meta.env.APP_PRIVATE_KEY || process.env.APP_PRIVATE_KEY;
  const installationId = parseInt(
    import.meta.env.APP_INSTALLATION_ID || process.env.APP_INSTALLATION_ID || '0',
    10
  );

  if (!appId || !installationId || !privateKey || !owner || !name) {
    return 0;
  }

  const graphqlWithAuth = await graphqlWithAppAuth(
    Number(appId),
    Number(installationId),
    privateKey
  );
  const jsonData: GitHubGraphQLResponse = await graphqlWithAuth(
    `
      query {
        repository(owner: "${owner}", name: "${name}") {
          stargazerCount
        }
      }
    `
  );

  return Object(jsonData).repository.stargazerCount;
}

export { stargazerCount };
