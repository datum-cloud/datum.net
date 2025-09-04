import { graphql } from '@octokit/graphql';

type GitHubGraphQLResponse = {
  repository: {
    stargazerCount: number;
  };
};

async function graphqlWithAppAuth(appId: number, appInstallationId: number, privateKey: string) {
  // Permissions: Read access to actions, actions variables, code, codespaces, codespaces metadata, deployments, discussions, issues, merge queues, metadata, pages, pull requests, secret scanning alerts, and secrets
  const { createAppAuth } = await import('@octokit/auth-app');

  const auth = createAppAuth({
    appId,
    privateKey,
    appInstallationId,
  });

  return graphql.defaults({
    request: {
      hook: auth.hook,
    },
  });
}

async function stargazerCount(): Promise<number> {
  const appId = import.meta.env.APP_ID || process.env.APP_ID;
  const privateKey = import.meta.env.APP_PRIVATE_KEY || process.env.APP_PRIVATE_KEY;
  const appInstallationId = parseInt(
    import.meta.env.APP_INSTALLATION_ID || process.env.APP_INSTALLATION_ID,
    10
  );

  if (!appId || !appInstallationId || !privateKey) {
    return 0;
  }

  const graphqlWithAuth = await graphqlWithAppAuth(appId, appInstallationId, privateKey);
  const jsonData: GitHubGraphQLResponse = await graphqlWithAuth(
    `
      query {
        repository(owner: "datum-cloud", name: "datum") {
          stargazerCount
        }
      }
    `
  );

  return Object(jsonData).repository.stargazerCount;
}

export { stargazerCount };
