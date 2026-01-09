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
  const firstParagraph = cleaned.match(/\n\n(.*?)\n\n/);
  return firstParagraph ? firstParagraph[1].trim().substring(0, 150) + '...' : fallback;
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
  const siteUrl = site;
  const prefix = basePath ? `${basePath}/` : '';

  if (id === 'index') {
    return basePath ? `${siteUrl}/${basePath}/` : `${siteUrl}/`;
  } else if (id.endsWith('/index')) {
    return `${siteUrl}/${prefix}${id.replace('/index', '')}/`;
  } else {
    return `${siteUrl}/${prefix}${id}/`;
  }
};

// Build URL specifically for docs (special case: docs live at /docs/ path)
export const buildDocsUrl = (id: string): string => {
  const siteUrl = site;

  if (id === 'index') {
    return `${siteUrl}/docs/`;
  } else if (id.endsWith('/index')) {
    return `${siteUrl}/docs/${id.replace('/index', '')}/`;
  } else {
    return `${siteUrl}/docs/${id}/`;
  }
};
