import type { AstroIntegration } from 'astro';
import { access, mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const DOCS_REPO_URL = process.env.DOCS_REPO_URL || 'https://github.com/datum-cloud/new-doc';
const DOCS_PATH = process.env.DOCS_REPO_PATH || 'docs';
const TMP_ARCHIVE = join(DOCS_PATH, '..', '.tmp-sync-docs.zip');

function parseGitHubUrl(url: string): { org: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!match) return null;
  return { org: match[1], repo: match[2] };
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function fetchLatestReleaseDate(org: string, repo: string): Promise<Date | null> {
  try {
    const { stdout } = await execAsync(
      `curl -fsSL "https://api.github.com/repos/${org}/${repo}/releases/latest"`,
      { encoding: 'utf-8' }
    );
    const release = JSON.parse(stdout) as { published_at?: string };
    return release.published_at ? new Date(release.published_at) : null;
  } catch {
    return null;
  }
}

async function fetchDefaultBranch(org: string, repo: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`curl -fsSL "https://api.github.com/repos/${org}/${repo}"`, {
      encoding: 'utf-8',
    });
    const data = JSON.parse(stdout) as { default_branch?: string };
    return data.default_branch ?? 'main';
  } catch {
    return 'main';
  }
}

export default function syncDocs(): AstroIntegration {
  return {
    name: 'sync-docs',
    hooks: {
      'astro:config:setup': async ({ logger }) => {
        if (!DOCS_REPO_URL) {
          logger.warn('sync-docs: DOCS_REPO_URL not set, skipping.');
          return;
        }

        const parsed = parseGitHubUrl(DOCS_REPO_URL);
        if (!parsed) {
          logger.warn(`sync-docs: cannot parse GitHub URL: ${DOCS_REPO_URL}`);
          return;
        }

        const { org, repo } = parsed;

        // Check if local docs are already up to date
        const docsExists = await fileExists(DOCS_PATH);
        if (docsExists) {
          const [localStat, releaseDate] = await Promise.all([
            stat(DOCS_PATH),
            fetchLatestReleaseDate(org, repo),
          ]);

          if (releaseDate && localStat.mtime >= releaseDate) {
            logger.info(`sync-docs: ${DOCS_PATH} is up to date, skipping.`);
            return;
          }

          logger.info(`sync-docs: ${DOCS_PATH} is outdated, re-downloading…`);
          await rm(DOCS_PATH, { recursive: true, force: true });
        }

        const branch = process.env.DOCS_REPO_BRANCH || (await fetchDefaultBranch(org, repo));

        const zipUrl = `https://github.com/${org}/${repo}/archive/refs/heads/${branch}.zip`;
        logger.info(`sync-docs: downloading ${zipUrl}…`);

        try {
          await mkdir(DOCS_PATH, { recursive: true });
          await execAsync(`curl -fsSL -o "${TMP_ARCHIVE}" "${zipUrl}"`);

          // Extract zip, strip the single top-level directory, dump contents into DOCS_PATH
          await execAsync(
            `unzip -q "${TMP_ARCHIVE}" -d "${TMP_ARCHIVE}.d" && ` +
              `top=$(ls -1 "${TMP_ARCHIVE}.d" | head -1) && ` +
              `cp -r "${TMP_ARCHIVE}.d/$top/." "${DOCS_PATH}/" && ` +
              `rm -rf "${TMP_ARCHIVE}.d"`
          );

          logger.info('sync-docs: download complete.');
        } finally {
          await rm(TMP_ARCHIVE, { force: true });
        }
      },
    },
  };
}
