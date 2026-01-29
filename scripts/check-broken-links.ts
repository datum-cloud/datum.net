#!/usr/bin/env tsx

/**
 * Check for broken links in markdown content files
 *
 * Scans all .md and .mdx files in src/content/ and validates:
 * - External URLs (checks if accessible, max 10 per file) - use --skip-external to skip
 * - Internal links (checks if target file exists) - use --check-external-only to skip
 *
 * Cloudflare note: Sites with Cloudflare bot protection may return 403 for Node.js
 * requests due to TLS fingerprinting (Node.js ≠ Chrome). Add such domains to SKIP_DOMAINS.
 *
 * Usage:
 *   npm run link:check                    # Check all links
 *   npm run link:check -- --skip-external # Skip external link checks
 *   npm run link:check:external           # Check only external links
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import https from 'node:https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const CONTENT_DIR = join(__dirname, '..', 'src', 'content');

interface LinkInfo {
  url: string;
  type: 'external' | 'internal' | 'anchor' | 'email';
  line: number;
  file: string;
}

interface BrokenLink extends LinkInfo {
  error: string;
}

interface CheckResult {
  file: string;
  brokenLinks: BrokenLink[];
}

// Regular expressions to extract links from markdown
const LINK_REGEX = /\[([^\]\[\]]+)\]\(([^)]+)\)/g; // More strict - exclude [ and ] from link text
const IMAGE_REGEX = /!\[([^\]\[\]]*)\]\(([^)]+)\)/g;
const HTML_LINK_REGEX = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi;
const REF_LINK_REGEX = /\[([^\]\[\]]+)\]:\s*(.+)$/gm;

// Skip these domains (rate limited, block automated requests, Cloudflare challenge, etc.)
const SKIP_DOMAINS = ['localhost', '127.0.0.1', '0.0.0.0', 'example.com', 'twitter.com', 'x.com'];

// Skip these URL patterns
const SKIP_PATTERNS = [
  /^mailto:/i,
  /^tel:/i,
  /^javascript:/i,
  /^#/i, // Same-page anchors (these are valid but hard to validate without rendering)
];

// CLI arguments
const args = process.argv.slice(2);
const SKIP_EXTERNAL = args.includes('--skip-external');
const CHECK_EXTERNAL_ONLY = args.includes('--check-external-only');

// Concurrency settings
const MAX_CONCURRENT_REQUESTS = 10;
const MAX_EXTERNAL_LINKS_PER_PAGE = 10; // Limit external link checks per file

async function getAllMarkdownFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip hidden directories and asset directories
      if (!entry.name.startsWith('.') && entry.name !== 'assets' && entry.name !== 'images') {
        const subFiles = await getAllMarkdownFiles(fullPath, baseDir);
        files.push(...subFiles);
      }
    } else if (
      entry.isFile() &&
      (extname(entry.name) === '.md' || extname(entry.name) === '.mdx')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractLinks(content: string, filePath: string): LinkInfo[] {
  const links: LinkInfo[] = [];
  const lines = content.split('\n');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    // Extract markdown links: [text](url)
    let match;
    while ((match = LINK_REGEX.exec(line)) !== null) {
      const url = match[2];
      links.push({
        url,
        type: classifyLink(url),
        line: lineNum + 1,
        file: relative(CONTENT_DIR, filePath),
      });
    }

    // Extract image links: ![alt](url)
    while ((match = IMAGE_REGEX.exec(line)) !== null) {
      const url = match[2];
      links.push({
        url,
        type: classifyLink(url),
        line: lineNum + 1,
        file: relative(CONTENT_DIR, filePath),
      });
    }

    // Extract HTML links
    LINK_REGEX.lastIndex = 0;
    while ((match = HTML_LINK_REGEX.exec(line)) !== null) {
      const url = match[1];
      links.push({
        url,
        type: classifyLink(url),
        line: lineNum + 1,
        file: relative(CONTENT_DIR, filePath),
      });
    }

    // Extract reference-style links: [text]: url
    while ((match = REF_LINK_REGEX.exec(line)) !== null) {
      const url = match[2];
      links.push({
        url,
        type: classifyLink(url),
        line: lineNum + 1,
        file: relative(CONTENT_DIR, filePath),
      });
    }
  }

  return links;
}

function classifyLink(url: string): LinkInfo['type'] {
  if (SKIP_PATTERNS.some((pattern) => pattern.test(url))) {
    return 'email';
  }

  // Skip absolute paths starting with / (they're likely Astro page routes)
  if (url.startsWith('/')) {
    return 'anchor'; // Treat as anchor to skip validation
  }

  // Skip URLs that contain HTML closing tags (false positive)
  if (url.includes('">') || url.includes("'>") || url.includes('!">')) {
    return 'anchor';
  }

  // Skip regex patterns (common in API docs)
  if (/^[\[\]?*$^+(){}\\]/.test(url) || url.includes('\\') || url.includes('[')) {
    return 'anchor';
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return 'external';
    }
  } catch {
    // Invalid URL, might be a relative path
  }

  if (url.startsWith('#')) {
    return 'anchor';
  }

  return 'internal';
}

interface ExternalLinkResult {
  valid: boolean;
  httpStatus?: number;
  errorType?: 'timeout' | 'connection' | 'unknown';
}

async function checkExternalLink(url: string): Promise<ExternalLinkResult> {
  try {
    const parsed = new URL(url);

    // Skip certain domains
    if (
      SKIP_DOMAINS.some(
        (domain) => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
      )
    ) {
      console.log(`    ⏭ Skipping ${url} (in skip list)`);
      return { valid: true };
    }

    return new Promise<ExternalLinkResult>((resolve) => {
      const client = parsed.protocol === 'https:' ? https : http;
      const timeout = 8000; // 8s - some gov/slow sites need more time

      // Browser-like headers to reduce Cloudflare/bot blocking
      // Use GET instead of HEAD - many sites block HEAD requests
      const headers: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-CH-UA': '"Chromium";v="131", "Google Chrome";v="131", "Not_A Brand";v="24"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"macOS"',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      };

      const req = client.request(url, { method: 'GET', timeout, headers }, (res) => {
        const status = res.statusCode || 0;
        // Consider 2xx and 3xx as valid
        const valid = status >= 200 && status < 400;
        resolve(valid ? { valid: true } : { valid: false, httpStatus: status });
        req.destroy(); // Abort immediately - we only need status, not body
      });

      req.on('error', () => {
        console.log(`    ✗ ${url} - Connection error`);
        resolve({ valid: false, errorType: 'connection' });
      });

      req.on('timeout', () => {
        console.log(`    ⏱ ${url} - Timeout (8s)`);
        req.destroy();
        resolve({ valid: false, errorType: 'timeout' });
      });

      req.end();
    });
  } catch {
    return { valid: false, errorType: 'unknown' };
  }
}

async function checkInternalLink(url: string, filePath: string): Promise<boolean> {
  const fileDir = dirname(filePath);

  try {
    // Resolve path relative to current file's directory
    const absolutePath = join(fileDir, url);

    // Handle anchors in internal links (e.g., docs/intro.md#features)
    const pathWithoutAnchor = absolutePath.split('#')[0];

    // Check if file exists
    await stat(pathWithoutAnchor);
    return true;
  } catch {
    // Only strip ./ prefix (not ../ or ../../)
    const hasDotSlashPrefix = url.match(/^\.\//);
    const hasParentPrefix = url.startsWith('../');
    const hasTrailingSlash = url.endsWith('/');

    // Clean URL: remove ./ prefix but keep ../ for now
    const cleanUrl = hasDotSlashPrefix ? url.replace(/^\.\//, '') : url;

    // Try with .md extension if no extension is provided
    if (!extname(cleanUrl)) {
      try {
        // For parent directory paths (../), append .md before the slash
        if (hasParentPrefix && hasTrailingSlash) {
          const urlWithoutSlash = url.replace(/\/+$/, '');
          const absolutePath = join(fileDir, urlWithoutSlash + '.md');
          await stat(absolutePath);
          return true;
        }

        // For same-directory paths (./ or no prefix), remove trailing slash
        const urlWithoutSlash = cleanUrl.replace(/\/+$/, '');
        const absolutePath = join(fileDir, urlWithoutSlash + '.md');
        await stat(absolutePath);
        return true;
      } catch {
        try {
          // Try .mdx extension
          if (hasParentPrefix && hasTrailingSlash) {
            const urlWithoutSlash = url.replace(/\/+$/, '');
            const absolutePath = join(fileDir, urlWithoutSlash + '.mdx');
            await stat(absolutePath);
            return true;
          }

          const urlWithoutSlash = cleanUrl.replace(/\/+$/, '');
          const absolutePath = join(fileDir, urlWithoutSlash + '.mdx');
          await stat(absolutePath);
          return true;
        } catch {
          // If path had trailing slash, try directory path
          if (hasTrailingSlash) {
            try {
              const absolutePath = join(fileDir, cleanUrl, 'index.md');
              await stat(absolutePath);
              return true;
            } catch {
              try {
                const absolutePath = join(fileDir, cleanUrl, 'index.mdx');
                await stat(absolutePath);
                return true;
              } catch {
                return false;
              }
            }
          }
          return false;
        }
      }
    }
    return false;
  }
}

async function validateLink(link: LinkInfo): Promise<BrokenLink | null> {
  // Skip email links and same-page anchors
  if (link.type === 'email' || link.type === 'anchor') {
    return null;
  }

  // Skip internal link check if --check-external-only flag is set
  if (CHECK_EXTERNAL_ONLY && link.type === 'internal') {
    return null;
  }

  // Skip external link check if flag is set
  if (link.type === 'external' && SKIP_EXTERNAL) {
    return null;
  }

  if (link.type === 'external') {
    const result = await checkExternalLink(link.url);
    if (!result.valid) {
      const statusSuffix = result.httpStatus
        ? ` (${result.httpStatus})`
        : result.errorType === 'timeout'
          ? ' (timeout)'
          : result.errorType === 'connection'
            ? ' (connection error)'
            : '';
      return {
        ...link,
        error: `External link is not accessible${statusSuffix}`,
      };
    }
    return null;
  }

  if (link.type === 'internal') {
    const filePath = join(CONTENT_DIR, link.file);
    const isValid = await checkInternalLink(link.url, filePath);
    if (!isValid) {
      return {
        ...link,
        error: 'Internal file does not exist',
      };
    }
    return null;
  }

  return null;
}

// Process links in batches for better performance
async function processLinksInBatches(links: LinkInfo[]): Promise<BrokenLink[]> {
  const brokenLinks: BrokenLink[] = [];
  const externalLinks = links.filter((l) => l.type === 'external');
  const otherLinks = links.filter((l) => l.type !== 'external');

  if (CHECK_EXTERNAL_ONLY) {
    // Only check external links
    console.log(`  Checking ${externalLinks.length} external links only`);

    const externalLinksToCheck = externalLinks.slice(0, MAX_EXTERNAL_LINKS_PER_PAGE);
    for (let i = 0; i < externalLinksToCheck.length; i += MAX_CONCURRENT_REQUESTS) {
      const batch = externalLinksToCheck.slice(i, i + MAX_CONCURRENT_REQUESTS);
      const results = await Promise.all(batch.map(validateLink));
      brokenLinks.push(...(results.filter((r) => r !== null) as BrokenLink[]));
    }

    if (externalLinks.length > MAX_EXTERNAL_LINKS_PER_PAGE) {
      console.log(
        `    Note: Skipped ${externalLinks.length - MAX_EXTERNAL_LINKS_PER_PAGE} external links (limit: ${MAX_EXTERNAL_LINKS_PER_PAGE}/file)`
      );
    }
  } else {
    // Normal mode: check all links
    // Process non-external links first (fast)
    for (const link of otherLinks) {
      if (link.type === 'email' || link.type === 'anchor') continue;
      const result = await validateLink(link);
      if (result) brokenLinks.push(result);
    }

    // Process external links in batches (limited to MAX_EXTERNAL_LINKS_PER_PAGE per file)
    if (!SKIP_EXTERNAL && externalLinks.length > 0) {
      const externalLinksToCheck = externalLinks.slice(0, MAX_EXTERNAL_LINKS_PER_PAGE);
      for (let i = 0; i < externalLinksToCheck.length; i += MAX_CONCURRENT_REQUESTS) {
        const batch = externalLinksToCheck.slice(i, i + MAX_CONCURRENT_REQUESTS);
        const results = await Promise.all(batch.map(validateLink));
        brokenLinks.push(...(results.filter((r) => r !== null) as BrokenLink[]));
      }

      if (externalLinks.length > MAX_EXTERNAL_LINKS_PER_PAGE) {
        console.log(
          `    Note: Skipped ${externalLinks.length - MAX_EXTERNAL_LINKS_PER_PAGE} external links (limit: ${MAX_EXTERNAL_LINKS_PER_PAGE}/file)`
        );
      }
    }
  }

  return brokenLinks;
}

async function checkFile(filePath: string): Promise<CheckResult> {
  const content = await readFile(filePath, 'utf-8');
  const links = extractLinks(content, filePath);
  const brokenLinks = await processLinksInBatches(links);

  console.log(`  Checking ${relative(CONTENT_DIR, filePath)} (${links.length} links)`);

  return {
    file: relative(CONTENT_DIR, filePath),
    brokenLinks,
  };
}

async function main(): Promise<void> {
  console.log('\n━━━ Broken Link Checker ━━━\n');
  console.log(`Scanning content files...${SKIP_EXTERNAL ? ' (skipping external links)' : ''}\n`);

  const markdownFiles = await getAllMarkdownFiles(CONTENT_DIR);
  console.log(`Found ${markdownFiles.length} markdown/MDX files\n`);

  let totalBrokenLinks = 0;
  const allResults: CheckResult[] = [];

  for (const file of markdownFiles) {
    try {
      const result = await checkFile(file);
      allResults.push(result);
      totalBrokenLinks += result.brokenLinks.length;
    } catch (error) {
      console.error(`  ✗ Error checking ${relative(CONTENT_DIR, file)}:`, error);
    }
  }

  console.log('\n━━━ Results ━━━\n');

  if (totalBrokenLinks === 0) {
    console.log('✓ No broken links found!\n');
    process.exit(0);
  }

  console.log(`✗ Found ${totalBrokenLinks} broken link(s):\n`);

  for (const result of allResults) {
    if (result.brokenLinks.length === 0) continue;

    console.log(`\n${result.file}:`);
    for (const link of result.brokenLinks) {
      console.log(`  Line ${link.line}: ${link.url}`);
      console.log(`    Type: ${link.type}`);
      console.log(`    Error: ${link.error}\n`);
    }
  }

  console.log(`\n━━━ Complete ━━━`);
  console.log(`Total broken links: ${totalBrokenLinks}\n`);

  process.exit(1);
}

main().catch((error) => {
  console.error('\n✗ Failed');
  console.error(error);
  process.exit(1);
});
