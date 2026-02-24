#!/usr/bin/env tsx

/**
 * Generate Datumctl Documentation
 *
 * Downloads documentation archives from GitHub releases and extracts them
 * into destination folders. Output directories are mocked for now.
 */

import { access, mkdir, rm, readFile, rename } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { parse as parseYaml } from 'yaml';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const CONFIG_FILE = join(PROJECT_ROOT, '.datumctl-docs-config.yaml');
const TMP_DIR = join(PROJECT_ROOT, '.tmp', 'datumctl-docs');
const DOWNLOAD_DIR = join(TMP_DIR, 'downloads');

const OUTPUT_DOCS_DIR = join('src/content/docs/docs/datumctl');
const OUTPUT_CLI_DOCS_DIR = join('src/content/docs/docs/datumctl/command');

interface SourceConfig {
  org: string;
  repo: string;
  version: string;
  projectName?: string;
}

interface Config {
  source: SourceConfig;
}

interface CliArgs {
  docsArchivePath?: string;
  cliArchivePath?: string;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function clean(): Promise<void> {
  console.log('Cleaning temporary files...');
  if (await fileExists(TMP_DIR)) {
    await rm(TMP_DIR, { recursive: true, force: true });
  }
  console.log('✓ Cleaned\n');
}

async function loadConfig(): Promise<SourceConfig> {
  const configContent = await readFile(CONFIG_FILE, 'utf-8');
  const config = parseYaml(configContent) as Config;

  if (!config?.source) {
    throw new Error('Invalid configuration: missing source');
  }

  const { org, repo, version } = config.source;

  if (!org || !repo || !version) {
    throw new Error('Invalid configuration: org, repo, and version are required');
  }

  return config.source;
}

function buildReleaseUrl(org: string, repo: string, version: string, archiveName: string): string {
  return `https://github.com/${org}/${repo}/releases/download/${version}/${archiveName}`;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const parsed: CliArgs = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--docs-archive') {
      parsed.docsArchivePath = args[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--cli-archive') {
      parsed.cliArchivePath = args[i + 1];
      i += 1;
      continue;
    }
  }

  return parsed;
}

async function downloadArchive(url: string, destination: string): Promise<void> {
  await mkdir(dirname(destination), { recursive: true });
  await execAsync(`curl -fsSL -o "${destination}" "${url}"`);
}

async function extractArchive(archivePath: string, destinationDir: string): Promise<void> {
  await mkdir(destinationDir, { recursive: true });
  await execAsync(`tar -xzf "${archivePath}" -C "${destinationDir}"`);
}

async function downloadAndExtract(): Promise<void> {
  console.log('Downloading datumctl docs...');

  const { org, repo, version, projectName } = await loadConfig();
  const resolvedProjectName = projectName ?? repo;
  const { docsArchivePath, cliArchivePath } = parseArgs();

  const docsArchive = `${resolvedProjectName}-docs_${version.substring(1)}.tar.gz`;
  const cliArchive = `${resolvedProjectName}-cli-docs_${version.substring(1)}.tar.gz`;

  const docsUrl = buildReleaseUrl(org, repo, version, docsArchive);
  const cliUrl = buildReleaseUrl(org, repo, version, cliArchive);

  const docsDownloadPath = join(DOWNLOAD_DIR, docsArchive);
  const cliDownloadPath = join(DOWNLOAD_DIR, cliArchive);

  const resolvedDocsArchivePath = docsArchivePath ? resolve(docsArchivePath) : docsDownloadPath;
  const resolvedCliArchivePath = cliArchivePath ? resolve(cliArchivePath) : cliDownloadPath;

  if (docsArchivePath) {
    if (!(await fileExists(resolvedDocsArchivePath))) {
      throw new Error(`Docs archive not found: ${resolvedDocsArchivePath}`);
    }
    console.log(`  ✓ using ${resolvedDocsArchivePath}`);
  } else {
    await downloadArchive(docsUrl, resolvedDocsArchivePath);
    console.log(`  ✓ ${docsArchive}`);
  }

  if (cliArchivePath) {
    if (!(await fileExists(resolvedCliArchivePath))) {
      throw new Error(`CLI archive not found: ${resolvedCliArchivePath}`);
    }
    console.log(`  ✓ using ${resolvedCliArchivePath}`);
  } else {
    await downloadArchive(cliUrl, resolvedCliArchivePath);
    console.log(`  ✓ ${cliArchive}`);
  }

  console.log('\nExtracting archives...');
  await extractArchive(resolvedDocsArchivePath, OUTPUT_DOCS_DIR);
  console.log(`  ✓ ${OUTPUT_DOCS_DIR}`);

  await extractArchive(resolvedCliArchivePath, OUTPUT_CLI_DOCS_DIR);
  console.log(`  ✓ ${OUTPUT_CLI_DOCS_DIR}`);

  const cliSourcePath = join(OUTPUT_CLI_DOCS_DIR, 'datumctl.md');
  const cliDestinationPath = join(dirname(OUTPUT_CLI_DOCS_DIR), 'cli-reference.md');
  if (await fileExists(cliSourcePath)) {
    await rm(cliDestinationPath, { force: true });
    await rename(cliSourcePath, cliDestinationPath);
    console.log(`  ✓ moved datumctl.md → ${cliDestinationPath}`);
  }

  console.log('✓ Done\n');
}

async function main(): Promise<void> {
  console.log('\n━━━ Datumctl Documentation Generation ━━━\n');

  await clean();
  await downloadAndExtract();

  console.log('━━━ Complete ━━━\n');
  console.log(`Docs output: ${OUTPUT_DOCS_DIR}`);
  console.log(`CLI docs output: ${OUTPUT_CLI_DOCS_DIR}\n`);
}

main().catch((error) => {
  console.error('\n✗ Failed');
  console.error(error);
  process.exit(1);
});
