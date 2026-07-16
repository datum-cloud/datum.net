// src/libs/strapi/drivers/resilient.ts
/**
 * Wraps a primary cache driver (Redis) with a file backup so transient or
 * permanent primary outages degrade to local file cache instead of crashing SSR.
 */
import type { CacheDriver, CacheSetOptions } from '@datum-cloud/strapi-revalidate';

export interface ResilientCacheDriverOptions {
  /** Label used in warning logs (e.g. "Redis"). */
  label?: string;
  /** When true, log full errors via console.debug. */
  debug?: boolean;
}

export class ResilientCacheDriver implements CacheDriver {
  private readonly primary: CacheDriver;
  private readonly backup: CacheDriver;
  private readonly options: ResilientCacheDriverOptions;

  constructor(
    primary: CacheDriver,
    backup: CacheDriver,
    options: ResilientCacheDriverOptions = {}
  ) {
    this.primary = primary;
    this.backup = backup;
    this.options = options;
  }

  private warn(op: string, err: unknown): void {
    const label = this.options.label ?? 'primary cache';
    console.warn(`[strapi-runtime] ${label} ${op} failed, using file cache backup:`, err);
    if (this.options.debug) {
      console.debug(err);
    }
  }

  private async withFallback<T>(
    op: string,
    primaryFn: () => Promise<T>,
    backupFn: () => Promise<T>
  ): Promise<T> {
    try {
      return await primaryFn();
    } catch (err) {
      this.warn(op, err);
      return backupFn();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    return this.withFallback(
      'get',
      () => this.primary.get<T>(key),
      () => this.backup.get<T>(key)
    );
  }

  async set<T>(key: string, data: T, options?: CacheSetOptions): Promise<void> {
    try {
      await this.primary.set(key, data, options);
    } catch (err) {
      this.warn('set', err);
      await this.backup.set(key, data, options);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.primary.delete(key);
    } catch (err) {
      this.warn('delete', err);
      await this.backup.delete(key);
    }
  }

  async deleteByTag(tag: string): Promise<void> {
    try {
      await this.primary.deleteByTag(tag);
    } catch (err) {
      this.warn('deleteByTag', err);
      await this.backup.deleteByTag(tag);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.primary.clear();
    } catch (err) {
      this.warn('clear', err);
      await this.backup.clear();
    }
  }

  async keys(prefix?: string): Promise<string[]> {
    return this.withFallback(
      'keys',
      () => this.primary.keys(prefix),
      () => this.backup.keys(prefix)
    );
  }
}
