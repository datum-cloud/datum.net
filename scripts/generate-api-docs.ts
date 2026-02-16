#!/usr/bin/env tsx

/**
 * Generate API Reference Documentation
 *
 * Downloads operator source repositories and generates MDX documentation from CRD definitions.
 */

import { readFile, writeFile, access, stat, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { parse as parseYaml } from 'yaml';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const CONFIG_FILE = join(PROJECT_ROOT, '.api-docs-config.yaml');
const CRD_REF_DOCS_VERSION = 'v0.2.0';
const CRD_REF_DOCS_PACKAGE = 'github.com/elastic/crd-ref-docs';
const TMP_DIR = join(PROJECT_ROOT, '.tmp');
const BIN_DIR = join(TMP_DIR, 'bin');
const SOURCES_DIR = join(TMP_DIR, 'sources', 'datum-cloud');
const TEMPLATES_DIR = join(PROJECT_ROOT, 'templates', 'api-docs');
const OUTPUT_FILE = join(PROJECT_ROOT, 'src/content/docs/docs/api/reference.mdx');

interface Source {
  name: string;
  org: string;
  repo: string;
  version: string;
}

interface Config {
  sources: Source[];
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

async function installTool(): Promise<void> {
  const toolPath = join(BIN_DIR, 'crd-ref-docs');

  if (await fileExists(toolPath)) {
    console.log('✓ crd-ref-docs already installed\n');
    return;
  }

  console.log(`Installing crd-ref-docs ${CRD_REF_DOCS_VERSION}...`);
  await mkdir(BIN_DIR, { recursive: true });
  await execAsync(`GOBIN="${BIN_DIR}" go install ${CRD_REF_DOCS_PACKAGE}@${CRD_REF_DOCS_VERSION}`);
  console.log('✓ Installed\n');
}

async function downloadRepo(repoName: string, repoPath: string, version: string): Promise<void> {
  const repoDir = join(SOURCES_DIR, repoName);
  await mkdir(repoDir, { recursive: true });

  const isSemanticVersion = /^v\d+\.\d+\.\d+/.test(version);
  const url = isSemanticVersion
    ? `https://github.com/${repoPath}/archive/refs/tags/${version}.zip`
    : `https://github.com/${repoPath}/archive/refs/heads/${version}.zip`;

  const zipFile = join(TMP_DIR, 'sources', `${repoName}.zip`);

  await execAsync(`curl -sL -o "${zipFile}" "${url}"`);
  await execAsync(`unzip -o -q "${zipFile}" -d "${repoDir}"`);

  const { stdout } = await execAsync(
    `find "${repoDir}" -maxdepth 1 -type d ! -path "${repoDir}" | head -1`
  );

  if (stdout.trim()) {
    await execAsync(
      `mv "${stdout.trim()}"/* "${repoDir}/" 2>/dev/null || ` +
        `(shopt -s dotglob && mv "${stdout.trim()}"/* "${repoDir}/" 2>/dev/null)`
    );
    await execAsync(`rmdir "${stdout.trim()}" 2>/dev/null || true`);
  }

  await execAsync(`rm -f "${zipFile}"`);
  console.log(`  ✓ ${repoName}`);
}

async function downloadSources(): Promise<void> {
  console.log('Downloading sources...');

  const configContent = await readFile(CONFIG_FILE, 'utf-8');
  const config = parseYaml(configContent) as Config;

  if (!config.sources || !Array.isArray(config.sources)) {
    throw new Error('Invalid configuration');
  }

  await mkdir(SOURCES_DIR, { recursive: true });

  for (const { name, org, repo, version } of config.sources) {
    if (!name || !org || !repo || !version) continue;
    await downloadRepo(name, `${org}/${repo}`, version);
  }

  console.log('✓ Downloaded\n');
}

async function generateDocs(): Promise<void> {
  console.log('Generating documentation...');

  const toolPath = join(BIN_DIR, 'crd-ref-docs');

  if (!(await fileExists(SOURCES_DIR))) {
    throw new Error(`Sources not found: ${SOURCES_DIR}`);
  }

  if (!(await fileExists(TEMPLATES_DIR))) {
    throw new Error(`Templates not found: ${TEMPLATES_DIR}`);
  }

  await mkdir(dirname(OUTPUT_FILE), { recursive: true });

  const { stdout, stderr } = await execAsync(
    `cd "${PROJECT_ROOT}" && "${toolPath}" ` +
      `--config=.crd-ref-docs.yaml ` +
      `--source-path="${SOURCES_DIR}" ` +
      `--templates-dir="${TEMPLATES_DIR}" ` +
      `--renderer=markdown ` +
      `--output-path="${OUTPUT_FILE}" ` +
      `--log-level=INFO`
  );

  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);

  // Save raw output from crd-ref-docs before post-processing
  const rawOutputFile = join(PROJECT_ROOT, '.tmp', 'reference.raw.mdx');
  await execAsync(`cp "${OUTPUT_FILE}" "${rawOutputFile}"`);
  console.log(`✓ Raw output saved to: ${rawOutputFile}\n`);

  // Post-process to escape MDX special characters
  let content = await readFile(OUTPUT_FILE, 'utf-8');

  // Escape special characters that MDX interprets as JSX
  content = content
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();

      // In table rows, numbered lists, or bullet lists, escape < and > characters
      // but preserve intentional <br /> tags used for formatting
      if (line.startsWith('|') || /^\d+\./.test(trimmed) || trimmed.startsWith('-')) {
        // Temporarily replace <br /> and <br/> tags with placeholders
        const BR_PLACEHOLDER = '___BR_TAG___';
        let processedLine = line
          .replace(/<br\s*\/>/gi, BR_PLACEHOLDER)
          .replace(/<=/g, '&lt;=')
          .replace(/>=/g, '&gt;=')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(new RegExp(BR_PLACEHOLDER, 'g'), '<br />');

        // Detect end of sentence followed by <br> and capitalize word
        // Pattern: word. <br />Word or word.<br />Word or word. <br /> Word
        // Replace single <br/> with double <br/><br/> for better paragraph spacing
        processedLine = processedLine.replace(
          /([^.<]+)\.\s*<br\s*\/>\s*([A-Z])/gi,
          (_match, beforeDot, nextWord) => {
            return `${beforeDot}.<br /><br />${nextWord}`;
          }
        );

        return processedLine;
      }

      // Detect end of sentence followed by <br> and capitalize word
      // Pattern: word. <br />Word or word.<br />Word or word. <br /> Word
      // Replace single <br/> with double <br/><br/> for better paragraph spacing
      line = line.replace(/([^.<]+)\.\s*<br\s*\/>\s*([A-Z])/gi, (_match, beforeDot, nextWord) => {
        return `${beforeDot}.<br /><br />${nextWord}`;
      });

      // Escape curly braces in links (they can appear anywhere)
      // Pattern: {text} inside markdown links [...](...)
      if (line.includes('](') && (line.includes('{') || line.includes('}'))) {
        line = line.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
      }

      return line;
    })
    .join('\n');

  await writeFile(OUTPUT_FILE, content, 'utf-8');

  const stats = await stat(OUTPUT_FILE);
  const sizeKB = (stats.size / 1024).toFixed(1);

  console.log(`✓ Generated ${sizeKB}KB\n`);
}

async function main(): Promise<void> {
  console.log('\n━━━ API Documentation Generation ━━━\n');

  await clean();
  await installTool();
  await downloadSources();
  await generateDocs();

  console.log('━━━ Complete ━━━\n');
  console.log(`Output: ${OUTPUT_FILE}\n`);
}

main().catch((error) => {
  console.error('\n✗ Failed');
  console.error(error);
  process.exit(1);
});
