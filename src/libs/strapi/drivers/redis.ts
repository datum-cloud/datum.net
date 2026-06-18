/**
 * Redis CacheDriver implementation for @datum-cloud/strapi-revalidate.
 *
 * The package ships a Redis driver stub that throws on every method.
 * This implementation provides the actual ioredis-backed behaviour.
 *
 * Tag → key membership is tracked in a Redis Set per tag so that
 * `deleteByTag` can remove all associated keys atomically without a
 * full key scan.
 */
import type { CacheDriver, CacheSetOptions } from '@datum-cloud/strapi-revalidate';
import Redis from 'ioredis';

function tagSetKey(tag: string): string {
  return `__tag__:${tag}`;
}

export class RedisCacheDriver implements CacheDriver {
  private readonly client: Redis;
  private readonly prefix: string;

  constructor(client: Redis, keyPrefix = 'strapi:') {
    this.client = client;
    this.prefix = keyPrefix;
  }

  private key(k: string): string {
    return `${this.prefix}${k}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(this.key(key));
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, data: T, options?: CacheSetOptions): Promise<void> {
    const serialised = JSON.stringify(data);
    const fullKey = this.key(key);

    if (options?.ttl && options.ttl > 0) {
      await this.client.set(fullKey, serialised, 'EX', options.ttl);
    } else {
      await this.client.set(fullKey, serialised);
    }

    if (options?.tags?.length) {
      const pipeline = this.client.pipeline();
      for (const tag of options.tags) {
        pipeline.sadd(this.key(tagSetKey(tag)), fullKey);
      }
      await pipeline.exec();
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(this.key(key));
  }

  async deleteByTag(tag: string): Promise<void> {
    const tagKey = this.key(tagSetKey(tag));
    const members = await this.client.smembers(tagKey);
    if (members.length === 0) return;
    const pipeline = this.client.pipeline();
    pipeline.del(...members);
    pipeline.del(tagKey);
    await pipeline.exec();
  }

  async clear(): Promise<void> {
    const keys = await this.keys();
    if (keys.length === 0) return;
    await this.client.del(...keys.map((k) => this.key(k)));
  }

  async keys(prefix?: string): Promise<string[]> {
    const pattern = `${this.prefix}${prefix ?? ''}*`;
    const fullKeys = await this.client.keys(pattern);
    return fullKeys.map((k) => k.slice(this.prefix.length));
  }
}
