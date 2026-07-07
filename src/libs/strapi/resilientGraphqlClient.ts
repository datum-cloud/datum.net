// src/libs/strapi/resilientGraphqlClient.ts
/**
 * Strapi GraphQL client with quiet transport-failure handling.
 *
 * Mirrors @datum-cloud/strapi-revalidate's GraphQLStrapiClient but logs a single
 * warning (no stack trace) when Strapi is unreachable so build/dev can fall back
 * to stale cache without noisy errors.
 */

import type { GraphQLClientOptions } from '@datum-cloud/strapi-revalidate';

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

let unavailableLogged = false;

function logStrapiUnavailable(url: string, reason: string): void {
  if (unavailableLogged) return;
  unavailableLogged = true;
  console.warn(
    `[strapi-runtime] Strapi not available at ${url} (${reason}), using fallback cache where available`
  );
}

function getTransportErrorReason(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === 'AbortError') return 'timeout';
    const cause = err.cause;
    if (cause instanceof Error) {
      const errno = cause as NodeJS.ErrnoException;
      if (errno.code) return errno.code;
      return cause.message;
    }
    return err.message;
  }
  return 'unknown error';
}

function isTransportError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (err.name === 'AbortError') return true;
  if (err.message === 'fetch failed') return true;
  if (/^Strapi 5\d{2} /.test(err.message)) return true;
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
  return Math.min(200 * 2 ** attempt, 2000);
}

export class ResilientGraphQLStrapiClient {
  private readonly options: GraphQLClientOptions;

  constructor(options: GraphQLClientOptions) {
    this.options = options;
  }

  async query<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
    const { retry } = this.options;
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        const result = await this.executeOnce<T>(query, variables);
        if (result !== null) return result;
        return null;
      } catch (err) {
        lastError = err;
        if (this.options.debug) {
          console.debug(
            `[strapi-runtime] graphql attempt ${attempt + 1}/${retry + 1} failed:`,
            getTransportErrorReason(err)
          );
        }
        if (attempt < retry) {
          await sleep(backoffMs(attempt));
        }
      }
    }

    if (lastError && isTransportError(lastError)) {
      logStrapiUnavailable(this.options.url, getTransportErrorReason(lastError));
    } else if (lastError instanceof Error && lastError.name === 'AbortError') {
      logStrapiUnavailable(this.options.url, 'timeout');
    } else if (lastError) {
      console.error('Error fetching from Strapi:', lastError);
    }

    return null;
  }

  private async executeOnce<T>(
    query: string,
    variables: Record<string, unknown>
  ): Promise<T | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

    try {
      const response = await fetch(`${this.options.url.replace(/\/$/, '')}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.options.token ? { Authorization: `Bearer ${this.options.token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        if (response.status >= 500) {
          throw new Error(`Strapi ${response.status} ${response.statusText}`);
        }
        console.error(`Strapi GraphQL error: ${response.status} ${response.statusText}`, text);
        return null;
      }

      const result = (await response.json()) as GraphQLResponse<T>;
      if (result.errors && result.errors.length > 0) {
        console.error('Strapi GraphQL errors:', result.errors);
        return null;
      }

      return result.data;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export function createResilientStrapiClient(
  config: Pick<GraphQLClientOptions, 'url' | 'token' | 'timeout' | 'retry' | 'debug'>
): ResilientGraphQLStrapiClient {
  return new ResilientGraphQLStrapiClient({
    url: config.url,
    token: config.token,
    timeout: config.timeout,
    retry: config.retry,
    debug: config.debug,
  });
}
