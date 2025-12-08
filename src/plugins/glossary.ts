import fs from 'node:fs';
import path from 'node:path';
import type { AstroIntegration } from 'astro';
import * as cheerio from 'cheerio';

const errorPrefix = '\x1b[31m';
const infoPrefix = '\x1b[32m';
const warnPrefix = '\x1b[33m';
const resetPrefix = '\x1b[0m';

export type GlossaryOptions =
  | {
      source: string;
      contentDir: string;
    }
  | undefined;

/**
 * Recursively find all .html files in a directory
 * @param {string} directoryPath - Path to the directory
 * @returns {string[]} - Array of file paths
 */
const findHtmlFiles = (directoryPath: string): string[] => {
  let fileList: string[] = [];

  if (!fs.existsSync(directoryPath)) {
    console.log('Directory not found:', directoryPath);
    return fileList;
  }

  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      fileList = fileList.concat(findHtmlFiles(filePath)); // Recurse into subdirectories
    } else if (filePath.endsWith('.html') || filePath.endsWith('.htm')) {
      fileList.push(filePath);
    }
  }

  return fileList;
};

/**
 * Read glossary source file
 * @param {string} source - Path to the glossary markdown file
 * @returns {string} - Markdown content
 */
const glossarySource = async (source: string): Promise<string> => {
  const fullPath = `./src/content/${source}`;
  let glossaryMarkdown = '';

  try {
    glossaryMarkdown = fs.readFileSync(fullPath, 'utf-8');
  } catch {
    console.warn(`%sError reading glossary source file: %s%s`, errorPrefix, errorPrefix, fullPath);
    return '';
  }

  return glossaryMarkdown;
};

/**
 * Extract headings and paragraphs from markdown
 * @param {string} markdown - Markdown content
 * @returns {object} - Object with headings as keys and paragraphs as values
 */
const extractMarkdown = (markdown: string = ''): object => {
  const headingRegex = /^(#+)\s(.+)$/gm;
  const headings: string[] = [];
  const paragraphRegex = /(^|\n\n)([^\n#].*?)(?=\n\n|$)/gs;
  const paragraphs: string[] = [];

  let headingMatch;
  let paragraphMatch;
  let glossary: Record<string, { title: string; description: string }> = {};

  while ((paragraphMatch = paragraphRegex.exec(markdown)) !== null) {
    // Filter out empty matches or lines that are clearly not paragraphs (e.g., list items, code blocks)
    const text = paragraphMatch[2].trim();
    if (text && !text.startsWith('-') && !text.startsWith('*') && !text.startsWith('`')) {
      paragraphs.push(text);
    }
  }

  while ((headingMatch = headingRegex.exec(markdown)) !== null) {
    headings.push(headingMatch[2]); // Capture group 2 contains the heading text
  }

  headings.forEach((heading, index) => {
    // glossary.push({ [heading]: paragraphs[index] });
    glossary = {
      ...glossary,
      [heading.toLowerCase()]: { title: heading, description: paragraphs[index] },
    };
  });

  if (Object.keys(glossary).length === 0) {
    console.warn(`%sNo glossary content found. Please check glossary format!`, errorPrefix);
    return {};
  }

  console.log(`- Glossary Extracted: %s`, warnPrefix, Object.keys(glossary).length);
  return glossary;
};

/**
 * Replaces glossary terms in HTML content but not in HTML attributes
 * @param {string} html - HTML content
 * @param {object} glossaryTerms - Object with terms to replace
 * @returns {string} - Updated HTML
 */
function applyGlossaryToContent(
  html: string,
  glossaryTerms: Record<string, { title: string; description: string }>
): string {
  const $ = cheerio.load(html);

  // Function to process text nodes only
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  function processNode(_index: number, node: any) {
    if (node.type === 'text') {
      const content = node.data;

      const terms = Object.keys(glossaryTerms).map(
        (term) =>
          // Escape special regex chars and add word boundaries
          `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`
      );

      const regex = new RegExp(`(${terms.join('|')})`, 'gi');

      // Replace matched terms
      const newContent = content.replace(regex, (match: string) => {
        const term = match.toLowerCase();
        const { title, description } = glossaryTerms[term] || {};
        return `<span class="glossary-term" data-glossary-title="${title}" data-glossary-description="${description}">${match}</span>`;
      });

      // Only replace if content changed
      if (content !== newContent) {
        $(node).replaceWith(newContent);
      }
    }
  }

  // Process all text nodes in the target container
  $('[data-glossary-body]').find('*').contents().each(processNode);

  return $.html();
}

/**
 * Build glossary and apply to HTML files
 * @param {GlossaryOptions} options - Glossary options
 */
async function buildGlossary(options: GlossaryOptions) {
  console.log(
    `\n%sBuilding glossary from:%s %s%s`,
    infoPrefix,
    infoPrefix,
    warnPrefix,
    options?.source || '',
    resetPrefix
  );

  if (options === undefined || options.source === undefined || options.contentDir === undefined) {
    console.log(
      '%sNo glossary source file or content directory specified in options.',
      errorPrefix
    );
    return;
  }

  const fullPath = `./dist/client/${options.contentDir}`;
  const glossaryMarkdown = await glossarySource(options.source);

  if (glossaryMarkdown === '' || glossaryMarkdown === undefined) {
    console.warn(`%sNo glossary content found!`, errorPrefix);
    return;
  }

  const extractedGlossary = extractMarkdown(glossaryMarkdown) as Record<
    string,
    { title: string; description: string }
  >;

  const files = findHtmlFiles(fullPath);

  if (files.length === 0) {
    console.log('%sNo HTML files found in directory: %s%s', warnPrefix, warnPrefix, fullPath);
    return;
  }

  console.log(`- Files found: %s%d`, warnPrefix, files.length);
  console.log(`%sStart patching files`, infoPrefix);

  files.forEach((file: string) => {
    try {
      // Create a regex pattern to match any of the glossary terms (case-insensitive)
      const originalContent = fs.readFileSync(file, 'utf-8');
      const newContent = applyGlossaryToContent(originalContent, extractedGlossary);

      fs.writeFileSync(`${file}`, newContent, 'utf-8');
      console.log(`%sPatching:%s%s %sDone`, warnPrefix, resetPrefix, file, infoPrefix);
    } catch (error) {
      console.log(`%sError parsing file: %s`, errorPrefix, errorPrefix, error);
      return;
    }
  });
  console.log(`%sGlossary applied to %d files.%s\n`, infoPrefix, files.length, resetPrefix);
}

const createGlossaryIntegration = (options: GlossaryOptions): AstroIntegration => {
  return {
    name: 'GlosarryBuilder',
    hooks: {
      'astro:build:done': async () => {
        try {
          console.log('running glossary build on build done...');
          buildGlossary(options);
        } catch (error) {
          console.log(`%sError create glossary:%s `, errorPrefix, errorPrefix, error);
          throw error;
        }
      },
      'astro:server:start': async () => {
        console.log('running glossary build on dev server start...');
        buildGlossary(options);
      },
    },
  };
};

export default createGlossaryIntegration;

export { buildGlossary };
