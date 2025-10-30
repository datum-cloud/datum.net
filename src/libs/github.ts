import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';
import { graphql } from '@octokit/graphql';
import type { RequestParameters } from '@octokit/types';

let response = {};
const appId = import.meta.env.APP_ID || process.env.APP_ID;
const privateKey = import.meta.env.APP_PRIVATE_KEY || process.env.APP_PRIVATE_KEY;
const installationId = parseInt(
  import.meta.env.APP_INSTALLATION_ID || process.env.APP_INSTALLATION_ID || '0',
  10
);

async function graph(query: string, variables: RequestParameters = {}) {
  if (appId && installationId && privateKey) {
    const auth = createAppAuth({
      appId,
      privateKey,
      installationId,
    });

    const octokitWithAuth = graphql.defaults({
      request: {
        hook: auth.hook,
      },
    });

    try {
      response = await octokitWithAuth(query, variables);
    } catch (error) {
      console.error('Error fetching with graphql: ', error);
    }
  }

  return response;
}

async function rest(query: string, variables: RequestParameters = {}) {
  if (appId && installationId && privateKey) {
    const octokitWithAuth = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        privateKey,
        installationId,
      },
    });

    try {
      response = await octokitWithAuth.request(query, variables);
    } catch (error) {
      console.error('Error fetching with rest: ', error);
    }
  }

  return response;
}

export { graph, rest };
