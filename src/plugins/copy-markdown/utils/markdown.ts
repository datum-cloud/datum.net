// src/plugins/copy-markdown/utils/markdown.ts
import { getCopyMarkdownConfig } from '../config';

/**
 * Serialize a value to YAML format
 * @param value - Value to serialize
 * @param indent - Current indentation level
 * @returns YAML-formatted string
 */
const serializeValue = (value: unknown, indent: number = 0): string => {
  const pad = '  '.repeat(indent);

  if (value === undefined || value === null) return '';
  if (typeof value === 'string') {
    const needsQuotes = /[:#\[\]{}|>&*!?,]/.test(value) || value.includes('\n');
    return needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    // Check if array contains simple values or objects
    const isSimple = value.every((v) => typeof v !== 'object' || v === null);
    if (isSimple) {
      return '\n' + value.map((item) => `${pad}  - ${serializeValue(item, 0)}`).join('\n');
    }
    return (
      '\n' +
      value
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            const objLines = serializeObject(item as Record<string, unknown>, indent + 2);
            const firstLine = objLines.split('\n')[0];
            const rest = objLines.split('\n').slice(1).join('\n');
            return `${pad}  - ${firstLine}${rest ? '\n' + rest : ''}`;
          }
          return `${pad}  - ${serializeValue(item, 0)}`;
        })
        .join('\n')
    );
  }
  if (typeof value === 'object') {
    return '\n' + serializeObject(value as Record<string, unknown>, indent + 1);
  }
  return String(value);
};

/**
 * Serialize an object to YAML format
 * @param obj - Object to serialize
 * @param indent - Current indentation level
 * @returns YAML-formatted string
 */
const serializeObject = (obj: Record<string, unknown>, indent: number = 0): string => {
  const pad = '  '.repeat(indent);
  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;

    const serialized = serializeValue(value, indent);
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      lines.push(`${pad}${key}:${serialized}`);
    } else if (Array.isArray(value) && value.length > 0) {
      lines.push(`${pad}${key}:${serialized}`);
    } else {
      lines.push(`${pad}${key}: ${serialized}`);
    }
  }

  return lines.join('\n');
};

/**
 * Serialize frontmatter data to YAML string
 * @param data - Frontmatter data object
 * @returns YAML-formatted frontmatter string
 */
export const serializeFrontmatter = (data: Record<string, unknown> | undefined): string => {
  if (!data || Object.keys(data).length === 0) return '';
  return serializeObject(data, 0);
};

/**
 * Extract frontmatter from markdown content
 * @param content - Raw markdown content
 * @returns Frontmatter text without delimiters
 */
export const extractFrontmatter = (content: string | undefined): string => {
  if (!content) return '';
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  return frontmatterMatch ? frontmatterMatch[1] : '';
};

/**
 * Remove frontmatter from markdown content
 * @param content - Raw markdown content
 * @returns Content without frontmatter
 */
export const removeFrontmatter = (content: string | undefined): string => {
  if (!content) return '';
  return content.replace(/^---\n[\s\S]*?\n---/, '').trim();
};

/**
 * Clean MDX imports and components from content
 * @param content - Markdown/MDX content
 * @returns Cleaned markdown content
 */
export const cleanMdxImports = (content: string | undefined): string => {
  if (!content) return '';
  let cleaned = content;
  // Remove import statements
  cleaned = cleaned.replace(/import\s+.*\s+from\s+['"].*['"];?\s*/g, '');
  // Remove MDX component declarations
  cleaned = cleaned.replace(/<\w+\s+.*?\/>/g, '');
  // Clean up multiple newlines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  return cleaned.trim();
};

/**
 * Extract the text of the first markdown heading, preferring frontmatter title
 * @param content - Markdown content
 * @param frontmatterData - Optional frontmatter data containing title
 * @returns First heading text or null
 */
export const extractFirstHeading = (
  content: string | undefined,
  frontmatterData?: Record<string, unknown>
): string | null => {
  // Prefer frontmatter title if available
  if (frontmatterData?.title && typeof frontmatterData.title === 'string') {
    return frontmatterData.title.trim();
  }

  if (!content) return null;
  const match = content.match(/^#{1,6}\s+(.+)$/m);
  return match ? match[1].trim() : null;
};

/**
 * Convert relative image paths to absolute URLs
 * @param content - Markdown content
 * @param baseUrl - Base URL for the site
 * @returns Content with absolute image URLs
 */
export const convertToAbsoluteUrls = (content: string, baseUrl: string): string => {
  if (!content || !baseUrl) return content;
  // Match markdown images with relative paths
  return content.replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, (_match, alt, path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `![${alt}](${baseUrl}${cleanPath})`;
  });
};

/**
 * Prepare markdown content for copying
 * Automatically reads config from plugin when options not provided
 * @param content - Raw markdown content (body without frontmatter from content collections)
 * @param options - Processing options (reads from plugin config if not specified)
 * @returns Processed markdown content
 */
export const prepareMarkdownForCopy = (
  content: string | undefined,
  options: {
    includeFrontmatter?: boolean;
    frontmatterData?: Record<string, unknown>;
    baseUrl?: string;
  } = {}
): string => {
  if (!content) return '';

  const config = getCopyMarkdownConfig();
  const { includeFrontmatter = config.includeFrontmatter, frontmatterData, baseUrl = '' } = options;
  let processed = content;

  // Clean MDX-specific syntax (body from content collections has no frontmatter)
  processed = cleanMdxImports(removeFrontmatter(processed));

  // Convert relative URLs to absolute if baseUrl provided
  if (baseUrl) {
    processed = convertToAbsoluteUrls(processed, baseUrl);
  }

  // Prepend frontmatter if requested and data provided
  if (includeFrontmatter && frontmatterData) {
    const frontmatterYaml = serializeFrontmatter(frontmatterData);
    if (frontmatterYaml) {
      processed = `---\n${frontmatterYaml}\n---\n\n${processed}`;
    }
  }

  // Prepend first heading as document title (prefers frontmatter title)
  const firstHeading = extractFirstHeading(processed, frontmatterData);
  if (firstHeading) {
    processed = `# ${firstHeading}\n\n${processed}`;
  }

  return processed;
};
