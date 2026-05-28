// src/libs/cacheViewer.ts

import fs from 'node:fs';
import path from 'node:path';

export type CacheEntry = {
  key: string;
  source: 'luma' | 'stargazer' | 'strapi' | 'strapi-fallback' | 'other';
  size: number;
  expiresAt: number | null;
  expired: boolean;
  preview: string;
};

export type CacheViewerData = {
  base: string;
  entries: CacheEntry[];
  bySource: {
    luma: CacheEntry[];
    stargazer: CacheEntry[];
    strapi: CacheEntry[];
    'strapi-fallback': CacheEntry[];
    other: CacheEntry[];
  };
};

function readCacheDir(dir: string, sourceLabel: 'strapi' | 'strapi-fallback'): CacheEntry[] {
  const entries: CacheEntry[] = [];
  if (!fs.existsSync(dir)) return entries;

  const files = fs.readdirSync(dir);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  for (const file of jsonFiles) {
    const key = path.basename(file, '.json');
    const filePath = path.join(dir, file);
    const expiresPath = path.join(dir, key + '.expires');

    let size = 0;
    let preview = '';
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      size = Buffer.byteLength(content, 'utf-8');
      const parsed = JSON.parse(content);
      const str = JSON.stringify(parsed);
      preview = str.length > 120 ? str.slice(0, 120) + '…' : str;
    } catch {
      preview = '(read error)';
    }

    let expiresAt: number | null = null;
    if (fs.existsSync(expiresPath)) {
      try {
        expiresAt = JSON.parse(fs.readFileSync(expiresPath, 'utf-8'));
      } catch {
        expiresAt = null;
      }
    }

    entries.push({
      key,
      source: sourceLabel,
      size,
      expiresAt,
      expired: expiresAt !== null && Date.now() > expiresAt,
      preview,
    });
  }
  return entries;
}

function classifySource(key: string): CacheEntry['source'] {
  if (key.startsWith('luma-')) return 'luma';
  if (key === 'stargazerCount') return 'stargazer';
  if (key.startsWith('strapi-')) return 'strapi';
  if (key === 'roadmaps' || key === 'changelogs') return 'stargazer';
  return 'other';
}

const CACHE_KEY_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export type CacheSourceFilter = 'main' | 'fallback' | 'auto';

export type CacheEntryByName = {
  key: string;
  source: CacheEntry['source'];
  data: unknown;
  size: number;
  expiresAt: number | null;
  expired: boolean;
};

export type GetCacheEntryResult =
  | { status: 'ok'; entry: CacheEntryByName }
  | { status: 'not_found' }
  | { status: 'invalid_json' };

/**
 * Validates a cache key is safe for filesystem lookup (no path traversal).
 */
export function isSafeCacheKey(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed !== name) {
    return false;
  }
  if (trimmed.includes('/') || trimmed.includes('\\')) {
    return false;
  }
  if (trimmed === '.' || trimmed === '..' || trimmed.includes('..')) {
    return false;
  }
  return CACHE_KEY_PATTERN.test(trimmed);
}

export function formatExpiresAt(ts: number | null): string {
  return ts === null
    ? '—'
    : new Date(ts).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatSizeKb(bytes: number): string {
  return `${Math.round((bytes / 1024) * 10) / 10} KB`;
}

function readExpiresAt(dir: string, key: string): number | null {
  const expiresPath = path.join(dir, `${key}.expires`);
  if (!fs.existsSync(expiresPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(expiresPath, 'utf-8')) as number;
  } catch {
    return null;
  }
}

function readCacheFile(
  dir: string,
  key: string,
  source: CacheEntry['source']
): GetCacheEntryResult {
  const filePath = path.join(dir, `${key}.json`);
  if (!fs.existsSync(filePath)) {
    return { status: 'not_found' };
  }

  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return { status: 'not_found' };
  }

  const size = Buffer.byteLength(content, 'utf-8');
  let data: unknown;
  try {
    data = JSON.parse(content) as unknown;
  } catch {
    return { status: 'invalid_json' };
  }

  const expiresAt = readExpiresAt(dir, key);

  return {
    status: 'ok',
    entry: {
      key,
      source,
      data,
      size,
      expiresAt,
      expired: expiresAt !== null && Date.now() > expiresAt,
    },
  };
}

/**
 * Reads a single cache entry from disk without mutating expired TTL files.
 */
export function getCacheEntryByName(
  name: string,
  options?: { source?: CacheSourceFilter }
): GetCacheEntryResult {
  const sourceFilter = options?.source ?? 'auto';
  const CACHE_BASE = path.resolve(process.cwd(), '.cache');
  const STRAPI_FALLBACK = path.join(CACHE_BASE, 'strapi-fallback');

  const dirs: Array<{ dir: string; source: CacheEntry['source'] }> = [];

  if (sourceFilter === 'main' || sourceFilter === 'auto') {
    dirs.push({ dir: CACHE_BASE, source: classifySource(name) });
  }
  if (sourceFilter === 'fallback' || sourceFilter === 'auto') {
    dirs.push({ dir: STRAPI_FALLBACK, source: 'strapi-fallback' });
  }

  let sawInvalidJson = false;

  for (const { dir, source } of dirs) {
    const result = readCacheFile(dir, name, source);
    if (result.status === 'ok') {
      return result;
    }
    if (result.status === 'invalid_json') {
      sawInvalidJson = true;
    }
  }

  if (sawInvalidJson) {
    return { status: 'invalid_json' };
  }

  return { status: 'not_found' };
}

export function getCacheViewerData(): CacheViewerData {
  const CACHE_BASE = path.resolve(process.cwd(), '.cache');
  const STRAPI_FALLBACK = path.join(CACHE_BASE, 'strapi-fallback');

  const mainEntries = readCacheDir(CACHE_BASE, 'strapi').map((e) => ({
    ...e,
    source: classifySource(e.key),
  }));

  const fallbackEntries = readCacheDir(STRAPI_FALLBACK, 'strapi-fallback');

  const allEntries = [...mainEntries, ...fallbackEntries].sort((a, b) =>
    `${a.source}-${a.key}`.localeCompare(`${b.source}-${b.key}`)
  );

  const bySource = {
    luma: allEntries.filter((e) => e.source === 'luma'),
    stargazer: allEntries.filter((e) => e.source === 'stargazer'),
    strapi: allEntries.filter((e) => e.source === 'strapi'),
    'strapi-fallback': allEntries.filter((e) => e.source === 'strapi-fallback'),
    other: allEntries.filter((e) => e.source === 'other'),
  };

  return { base: CACHE_BASE, entries: allEntries, bySource };
}
