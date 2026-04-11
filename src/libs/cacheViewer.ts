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
