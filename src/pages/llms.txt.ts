import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const port = parseInt(import.meta.env.PORT || '4321');

// Function to extract the frontmatter as text
const extractFrontmatter = (content: string | undefined): string => {
  if (!content) return '';

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  return frontmatterMatch ? frontmatterMatch[1] : '';
};

// Function to clean content while keeping relevant information
const cleanContent = (content: string | undefined): string => {
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
const extractDescription = (content: string | undefined, fallback: string = ''): string => {
  if (!content) return fallback;
  const cleaned = cleanContent(content);
  const firstParagraph = cleaned.match(/\n\n(.*?)\n\n/);
  return firstParagraph ? firstParagraph[1].trim().substring(0, 150) + '...' : fallback;
};

export const GET: APIRoute = async () => {
  try {
    // Get project info
    const projectName = 'Datum Cloud Network Solutions';
    const siteUrl = import.meta.env.SITE || `http://localhost:${port}`;

    // Base structure for llms.txt
    let llmsContent = `# ${projectName} Documentation\n\n`;
    llmsContent += `## About\n\n`;
    llmsContent += `Datum provides enterprise-grade cloud network solutions. This document contains structured information about our documentation and blog posts.\n\n`;

    // Get all pages sorted
    const pages = await getCollection('pages');
    const sortedPages = pages.sort((a, b) => (a.data.order || 999) - (b.data.order || 999));

    llmsContent += `## Pages\n\n`;

    for (const page of sortedPages) {
      // Get a brief description using the cleanContent function
      const description: string =
        page.data.description || extractDescription(page.body, 'No description available');

      // Add page metadata with description
      llmsContent += `- [${page.data.title}](${siteUrl}/${page.id}) - ${description}\n`;
    }

    // Get all blog posts sorted by date (newest first)
    const posts = await getCollection('blog', ({ data }) => !data.draft);
    const sortedPosts = posts.sort(
      (a, b) => new Date(b.data.date || 0).valueOf() - new Date(a.data.date || 0).valueOf()
    );

    llmsContent += `\n## Blog\n\n`;

    for (const post of sortedPosts) {
      // Get a brief description using the cleanContent function
      const description =
        post.data.description || extractDescription(post.body, 'No description available');

      // Add post metadata with description
      llmsContent += `- [${post.data.title}](${siteUrl}/blog/${post.id}) - ${description}\n`;
    }

    // Get all documentation entries
    const docs = await getCollection('docs');

    // Group docs by category
    const tutorials = docs.filter((doc) => doc.id.startsWith('tutorials/'));
    const tasks = docs.filter((doc) => doc.id.startsWith('tasks/'));
    const api = docs.filter((doc) => doc.id.startsWith('api/'));
    const other = docs.filter(
      (doc) =>
        !doc.id.startsWith('tutorials/') &&
        !doc.id.startsWith('tasks/') &&
        !doc.id.startsWith('api/')
    );

    llmsContent += `\n## Documentation\n\n`;

    // Add tutorials
    if (tutorials.length > 0) {
      llmsContent += `### Tutorials\n\n`;
      for (const doc of tutorials) {
        const description =
          doc.data.description || extractDescription(doc.body, 'No description available');
        llmsContent += `- [${doc.data.title}](${siteUrl}/${doc.id}) - ${description}\n`;
      }
    }

    // Add tasks
    if (tasks.length > 0) {
      llmsContent += `\n### Tasks\n\n`;
      for (const doc of tasks) {
        const description =
          doc.data.description || extractDescription(doc.body, 'No description available');
        llmsContent += `- [${doc.data.title}](${siteUrl}/${doc.id}) - ${description}\n`;
      }
    }

    // Add API docs
    if (api.length > 0) {
      llmsContent += `\n### API\n\n`;
      for (const doc of api) {
        const description =
          doc.data.description || extractDescription(doc.body, 'No description available');
        llmsContent += `- [${doc.data.title}](${siteUrl}/${doc.id}) - ${description}\n`;
      }
    }

    // Add other docs
    if (other.length > 0) {
      llmsContent += `\n### Other Documentation\n\n`;
      for (const doc of other) {
        const description =
          doc.data.description || extractDescription(doc.body, 'No description available');
        llmsContent += `- [${doc.data.title}](${siteUrl}/${doc.id}) - ${description}\n`;
      }
    }

    // Get all handbook entries
    const handbooks = await getCollection('handbooks', ({ data }) => !data.draft);

    // Group handbooks by category
    const handbookCategories: { [key: string]: typeof handbooks } = {};

    handbooks.forEach((handbook) => {
      const category = handbook.id.split('/')[0];
      if (!handbookCategories[category]) {
        handbookCategories[category] = [];
      }
      handbookCategories[category].push(handbook);
    });

    llmsContent += `\n## Handbook\n\n`;

    // Add handbook entries by category
    for (const category in handbookCategories) {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      llmsContent += `### ${categoryName}\n\n`;

      // Sort by sidebar order if available
      const sortedHandbooks = handbookCategories[category].sort((a, b) => {
        const orderA = a.data.sidebar?.order || 999;
        const orderB = b.data.sidebar?.order || 999;
        return orderA - orderB;
      });

      for (const handbook of sortedHandbooks) {
        const description =
          handbook.data.description ||
          extractDescription(handbook.body, 'No description available');
        llmsContent += `- [${handbook.data.title}](${siteUrl}/handbook/${handbook.id}) - ${description}\n`;
      }
    }

    llmsContent += `\n## API\n\n`;
    llmsContent += `For API documentation, please refer to the following endpoints:\n`;
    llmsContent += `- ${siteUrl}/api/* - API endpoints\n`;

    // Return the response as plain text
    return new Response(llmsContent, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Failed to generate llms.txt:', error);
    return new Response('Error generating llms.txt', { status: 500 });
  }
};
