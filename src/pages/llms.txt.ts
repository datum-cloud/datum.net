import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from 'astro:config/client';
import { extractDescription, buildUrl, buildDocsUrl } from '@utils/llmsUtils';
import { fetchStrapiArticles } from '@libs/strapi';

export const GET: APIRoute = async () => {
  try {
    // Get project info
    const projectName = 'Datum Cloud Network Solutions';
    const siteUrl = site;

    // Base structure for llms.txt
    let llmsContent = `# ${projectName} Documentation\n\n`;
    llmsContent += `## About\n\n`;
    llmsContent += `Datum provides enterprise-grade cloud network solutions. This document contains structured information about our documentation and blog posts.\n\n`;

    // Get all pages sorted, excluding home/* pages
    const pages = await getCollection('pages');
    const filteredPages = pages.filter((page) => !page.id.startsWith('home/'));
    const sortedPages = filteredPages.sort((a, b) => (a.data.order || 999) - (b.data.order || 999));

    llmsContent += `## Pages\n\n`;

    for (const page of sortedPages) {
      const description: string =
        page.data.description || extractDescription(page.body, 'No description available');
      const pageUrl = buildUrl(page.id);
      llmsContent += `- [${page.data.title}](${pageUrl}) - ${description}\n`;
    }

    // Get all blog posts from Strapi sorted by date (newest first)
    const strapiArticles = await fetchStrapiArticles();
    const sortedPosts = strapiArticles.sort((a, b) => {
      const dateA = a.originalPublishedAt ? new Date(a.originalPublishedAt).getTime() : 0;
      const dateB = b.originalPublishedAt ? new Date(b.originalPublishedAt).getTime() : 0;
      return dateB - dateA;
    });

    llmsContent += `\n## Blog\n\n`;

    for (const post of sortedPosts) {
      const description = post.description || 'No description available';
      const postUrl = buildUrl(post.slug, 'blog');
      llmsContent += `- [${post.title}](${postUrl}) - ${description}\n`;
    }

    // Get all Docs entries
    const docs = await getCollection('docs');

    // Add Docs
    if (docs.length > 0) {
      llmsContent += `\n## Docs\n\n`;
      for (const doc of docs) {
        const description =
          doc.data.description || extractDescription(doc.body, 'No description available');
        const docUrl = buildDocsUrl(doc.id);
        llmsContent += `- [${doc.data.title}](${docUrl}) - ${description}\n`;
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
      llmsContent += `\n### ${categoryName}\n\n`;

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
        const handbookUrl = buildUrl(handbook.id, 'handbook');
        llmsContent += `- [${handbook.data.title}](${handbookUrl}) - ${description}\n`;
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
