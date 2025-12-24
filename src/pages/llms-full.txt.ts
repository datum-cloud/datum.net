import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from 'astro:config/client';

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

// Format date safely
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'No date available';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch {
    return 'Invalid date';
  }
};

export const GET: APIRoute = async () => {
  try {
    // Get project info
    const projectName = 'Datum Cloud Network Solutions';
    const siteUrl = site;

    // Base structure for llms.txt
    let llmsContent = `# ${projectName} Documentation\n\n`;
    llmsContent += `## About\n\n`;
    llmsContent += `Datum provides enterprise-grade cloud network solutions. This document contains comprehensive information about our documentation and blog posts.\n\n`;

    // Get all pages sorted, excluding home/* pages
    const pages = await getCollection('pages');
    const filteredPages = pages.filter((page) => !page.id.startsWith('home/'));
    const sortedPages = filteredPages.sort((a, b) => (a.data.order || 999) - (b.data.order || 999));

    llmsContent += `## Pages\n\n`;

    for (const page of sortedPages) {
      // Add page metadata
      let pageUrl: string;
      if (page.id === 'index') {
        pageUrl = `${siteUrl}/`;
      } else if (page.id.endsWith('/index')) {
        pageUrl = `${siteUrl}/${page.id.replace('/index', '')}/`;
      } else {
        pageUrl = `${siteUrl}/${page.id}/`;
      }
      llmsContent += `- [${page.data.title || page.id}](${pageUrl})\n`;
    }

    // Get all blog posts sorted by date (newest first)
    const posts = await getCollection('blog', ({ data }) => !data.draft);
    const sortedPosts = posts.sort((a, b) => {
      // Safely handle missing or invalid dates
      const dateA = a.data.date ? new Date(a.data.date).valueOf() : 0;
      const dateB = b.data.date ? new Date(b.data.date).valueOf() : 0;
      return dateB - dateA;
    });

    llmsContent += `\n## Blog\n\n`;

    for (const post of sortedPosts) {
      let postUrl: string;
      if (post.id === 'index') {
        postUrl = `${siteUrl}/blog/`;
      } else if (post.id.endsWith('/index')) {
        postUrl = `${siteUrl}/blog/${post.id.replace('/index', '')}/`;
      } else {
        postUrl = `${siteUrl}/blog/${post.id}/`;
      }
      llmsContent += `- [${post.data.title || post.id}](${postUrl})\n`;
    }

    // Get all Docs entries
    const docs = await getCollection('docs');

    // Add Docs
    if (docs.length > 0) {
      llmsContent += `\n## Docs\n\n`;
      for (const doc of docs) {
        const description =
          doc.data.description || extractDescription(doc.body, 'No description available');
        let docUrl: string;
        if (doc.id === 'index') {
          docUrl = `${siteUrl}/`;
        } else if (doc.id.endsWith('/index')) {
          docUrl = `${siteUrl}/${doc.id.replace('/index', '')}/`;
        } else {
          docUrl = `${siteUrl}/${doc.id}/`;
        }
        llmsContent += `- [${doc.data.title}](${docUrl}) - ${description}\n`;
      }
    }

    llmsContent += `\n## API\n\n`;
    llmsContent += `For API documentation, please refer to the following endpoints:\n`;
    llmsContent += `- ${siteUrl}/api/* - API endpoints\n`;

    // Add full detailed content section
    llmsContent += '\n\n---\n\n';

    llmsContent += `# Full Content\n\n`;

    // Add page content
    llmsContent += `## Pages \n\n`;

    for (const page of sortedPages) {
      llmsContent += `### ${page.data.title || page.id}\n\n`;
      let pageUrl: string;
      if (page.id === 'index') {
        pageUrl = `${siteUrl}/`;
      } else if (page.id.endsWith('/index')) {
        pageUrl = `${siteUrl}/${page.id.replace('/index', '')}/`;
      } else {
        pageUrl = `${siteUrl}/${page.id}/`;
      }
      llmsContent += `URL: ${pageUrl}\n\n`;

      // Add description if available
      if (page.data.description) {
        llmsContent += `Description: ${page.data.description}\n\n`;
      }

      // Process the content, keeping frontmatter as text
      try {
        llmsContent += cleanContent(page.body) + '\n\n';
      } catch (error) {
        llmsContent += `[Content processing error: ${error}]\n\n`;
      }
      llmsContent += '---\n\n';
    }

    // Add blog content
    llmsContent += `## Blog Content\n\n`;

    for (const post of sortedPosts) {
      llmsContent += `### ${post.data.title || post.id}\n\n`;
      let postUrl: string;
      if (post.id === 'index') {
        postUrl = `${siteUrl}/blog/`;
      } else if (post.id.endsWith('/index')) {
        postUrl = `${siteUrl}/blog/${post.id.replace('/index', '')}/`;
      } else {
        postUrl = `${siteUrl}/blog/${post.id}/`;
      }
      llmsContent += `URL: ${postUrl}\n\n`;

      // Add date if available
      if (post.data.date) {
        llmsContent += `Date: ${formatDate(post.data.date)}\n\n`;
      }

      // Add description if available
      if (post.data.description) {
        llmsContent += `Description: ${post.data.description}\n\n`;
      }

      // Add categories if available
      if (
        post.data.categories &&
        Array.isArray(post.data.categories) &&
        post.data.categories.length > 0
      ) {
        llmsContent += `Categories: ${post.data.categories.join(', ')}\n\n`;
      }

      // Process the content, keeping frontmatter as text
      try {
        llmsContent += cleanContent(post.body) + '\n\n';
      } catch (error) {
        llmsContent += `[Content processing error: ${error}]\n\n`;
      }
      llmsContent += '---\n\n';
    }

    // Add docs content
    if (docs.length > 0) {
      llmsContent += `## Docs\n\n`;
      for (const doc of docs) {
        llmsContent += `### ${doc.data.title || doc.id}\n\n`;
        let docUrl: string;
        if (doc.id === 'index') {
          docUrl = `${siteUrl}/`;
        } else if (doc.id.endsWith('/index')) {
          docUrl = `${siteUrl}/${doc.id.replace('/index', '')}/`;
        } else {
          docUrl = `${siteUrl}/${doc.id}/`;
        }
        llmsContent += `URL: ${docUrl}\n\n`;

        // Add description if available
        if (doc.data.description) {
          llmsContent += `Description: ${doc.data.description}\n\n`;
        }

        // Process the content, keeping frontmatter as text
        try {
          llmsContent += cleanContent(doc.body) + '\n\n';
        } catch (error) {
          llmsContent += `[Content processing error: ${error}]\n\n`;
        }
        llmsContent += '---\n\n';
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

    // Add handbook content
    llmsContent += `## Handbook Content\n\n`;

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
        llmsContent += `#### ${handbook.data.title}\n\n`;
        let handbookUrl: string;
        if (handbook.id === 'index') {
          handbookUrl = `${siteUrl}/handbook/`;
        } else if (handbook.id.endsWith('/index')) {
          handbookUrl = `${siteUrl}/handbook/${handbook.id.replace('/index', '')}/`;
        } else {
          handbookUrl = `${siteUrl}/handbook/${handbook.id}/`;
        }
        llmsContent += `URL: ${handbookUrl}\n\n`;

        // Add description if available
        if (handbook.data.description) {
          llmsContent += `Description: ${handbook.data.description}\n\n`;
        }

        // Add reading time if available
        if (handbook.data.readingTime) {
          llmsContent += `Reading Time: ${handbook.data.readingTime}\n\n`;
        }

        // Add updated date if available
        if (handbook.data.lastModified) {
          llmsContent += `Updated: ${handbook.data.lastModified}\n\n`;
        }

        // Add authors if available
        if (handbook.data.authors) {
          llmsContent += `Authors: ${handbook.data.authors}\n\n`;
        }

        // Process the content, keeping frontmatter as text
        try {
          llmsContent += cleanContent(handbook.body) + '\n\n';
        } catch (error) {
          llmsContent += `[Content processing error: ${error}]\n\n`;
        }
        llmsContent += '---\n\n';
      }
    }

    // Return the response as plain text
    return new Response(llmsContent, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Failed to generate llms-full.txt:', error);
    return new Response(`Error generating llms-full.txt: ${error}`, { status: 500 });
  }
};
