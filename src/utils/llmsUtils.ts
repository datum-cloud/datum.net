import { site } from 'astro:config/client';

// Function to extract the frontmatter as text
export const extractFrontmatter = (content: string | undefined): string => {
  if (!content) return '';

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  return frontmatterMatch ? frontmatterMatch[1] : '';
};

// Function to clean content while keeping relevant information
export const cleanContent = (content: string | undefined): string => {
  if (!content) return 'No content available';

  // Extract the frontmatter as text
  const frontmatterText = extractFrontmatter(content);

  // Remove the frontmatter delimiters
  let cleanedContent = content.replace(/^---\n[\s\S]*?\n---/, '');

  // Clean up MDX-specific imports
  cleanedContent = cleanedContent.replace(/import\s+.*\s+from\s+['"].*['"];?\s*/g, '');

  // Remove MDX component declarations
  cleanedContent = cleanedContent.replace(/<\w+\s+.*?\/>/g, '');

  // Clean up multiple newlines
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Return the frontmatter as text, followed by the cleaned content
  return frontmatterText + '\n\n' + cleanedContent.trim();
};

// Extract description from a page or post for the concise version
export const extractDescription = (content: string | undefined, fallback: string = ''): string => {
  if (!content) return fallback;
  const cleaned = cleanContent(content);

  // Split into paragraphs and find the first real text paragraph
  const paragraphs = cleaned.split(/\n\n+/);

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    // Skip empty paragraphs, frontmatter-like lines, headers, and code comments
    if (
      !trimmed ||
      (trimmed.includes(':') && !trimmed.includes(' ')) || // frontmatter key without space
      /^#{1,6}\s/.test(trimmed) || // markdown headers
      /^\/\//.test(trimmed) || // comment lines
      /^import\s/.test(trimmed) || // import statements
      /^</.test(trimmed) // JSX/HTML tags
    ) {
      continue;
    }
    // Clean up any remaining artifacts
    const description = trimmed
      .replace(/^#+\s*/, '') // remove leading headers
      .replace(/\/\/+/g, '') // remove comment markers
      .replace(/\s+/g, ' ') // normalize whitespace
      .trim();

    if (description.length > 0) {
      return description;
    }
  }

  return fallback;
};

// Format date safely
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'No date available';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch {
    return 'Invalid date';
  }
};

// Build URL for a content item
export const buildUrl = (id: string, basePath: string = ''): string => {
  // Normalize siteUrl - remove trailing slashes
  const siteUrl = (site || '').replace(/\/+$/, '');
  const prefix = basePath ? `${basePath}/` : '';

  // Normalize id - remove leading/trailing slashes
  const cleanId = id.replace(/^\/+|\/+$/g, '');

  if (cleanId === '' || cleanId === 'index') {
    return basePath ? `${siteUrl}/${basePath}/` : `${siteUrl}/`;
  } else if (cleanId.endsWith('/index')) {
    return `${siteUrl}/${prefix}${cleanId.replace('/index', '')}/`;
  } else {
    return `${siteUrl}/${prefix}${cleanId}/`;
  }
};

// Build URL specifically for docs (special case: docs live at /docs/ path)
export const buildDocsUrl = (id: string): string => {
  // Normalize siteUrl - remove trailing slashes
  const siteUrl = (site || '').replace(/\/+$/, '');

  // Strip leading 'docs/' or exact 'docs' (content lives in docs/docs/)
  let cleanId = id.replace(/^\/+|\/+$/g, '');
  if (cleanId === 'docs') {
    cleanId = 'index';
  } else if (cleanId.startsWith('docs/')) {
    cleanId = cleanId.slice(5);
  }

  if (cleanId === '' || cleanId === 'index') {
    return `${siteUrl}/docs/`;
  } else if (cleanId.endsWith('/index')) {
    return `${siteUrl}/docs/${cleanId.replace('/index', '')}/`;
  } else {
    return `${siteUrl}/docs/${cleanId}/`;
  }
};
