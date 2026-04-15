import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from 'astro:config/client';
import { cleanContent, formatDate, buildUrl, stripHtml } from '@utils/llmsUtils';
import { fetchStrapiArticles } from '@libs/strapi';

export const GET: APIRoute = async () => {
  try {
    const siteUrl = site;

    // Base structure for llms-full.txt
    let llmsContent = `# Datum\n\n`;
    llmsContent += `## About\n\n`;
    llmsContent += `> Datum is an open source network cloud for AI, founded in 2024 and backed by $13.6M from Amplify Partners, CRV, Encoded Ventures, Cervin Ventures, Ex/Ante, Step Function, and Vine Ventures. Built for AI-native developers and alternative cloud providers, Datum provides an Envoy-based AI Edge across 17+ global regions, QUIC-based secure tunnels (Connectors), authoritative DNS, and programmatic domain management — all with a forever-free Builder tier. Core platform licensed AGPLv3. Founded by Zac Smith (ex-Equinix, Packet) and Jacob Smith.\n\n`;

    // Get all pages sorted, excluding home/* pages
    const pages = await getCollection('pages');
    const filteredPages = pages.filter((page) => !page.id.startsWith('home/'));
    const sortedPages = filteredPages.sort((a, b) => (a.data.order || 999) - (b.data.order || 999));

    llmsContent += `## Pages\n\n`;

    for (const page of sortedPages) {
      const pageUrl = buildUrl(page.id);
      const pageTitle = stripHtml(page.data.title);
      llmsContent += `- [${pageTitle}](${pageUrl})\n`;
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
      const postUrl = buildUrl(post.slug, 'blog');
      llmsContent += `- [${post.title}](${postUrl})\n`;
    }

    llmsContent += `\n## Docs\n\n`;
    llmsContent += `- Full documentation available at ${siteUrl}/docs/llms-full.txt\n`;

    llmsContent += `\n## API\n\n`;
    llmsContent += `For API documentation, please refer to the following endpoints:\n`;
    llmsContent += `- ${siteUrl}/api/* - API endpoints\n`;

    // Full detailed content
    llmsContent += '\n\n---\n\n';
    llmsContent += `# Full Content\n\n`;

    // Page content
    llmsContent += `## Pages\n\n`;

    for (const page of sortedPages) {
      const pageTitle = stripHtml(page.data.title);
      llmsContent += `### ${pageTitle}\n\n`;
      llmsContent += `URL: ${buildUrl(page.id)}\n\n`;

      if (page.data.description) {
        llmsContent += `Description: ${page.data.description}\n\n`;
      }

      try {
        llmsContent += cleanContent(page.body) + '\n\n';
      } catch (error) {
        llmsContent += `[Content processing error: ${error}]\n\n`;
      }
      llmsContent += '---\n\n';
    }

    // Blog content (summary only — full body served from Strapi CMS)
    llmsContent += `## Blog Content\n\n`;

    for (const post of sortedPosts) {
      llmsContent += `### ${post.title}\n\n`;
      llmsContent += `URL: ${buildUrl(post.slug, 'blog')}\n\n`;

      if (post.originalPublishedAt) {
        llmsContent += `Date: ${formatDate(post.originalPublishedAt)}\n\n`;
      }

      if (post.description) {
        llmsContent += `Description: ${post.description}\n\n`;
      }

      llmsContent += '---\n\n';
    }

    // Handbook content
    const handbooks = await getCollection('handbooks', ({ data }) => !data.draft);

    const handbookCategories: { [key: string]: typeof handbooks } = {};
    handbooks.forEach((handbook) => {
      const category = handbook.id.split('/')[0];
      if (!handbookCategories[category]) {
        handbookCategories[category] = [];
      }
      handbookCategories[category].push(handbook);
    });

    llmsContent += `## Handbook Content\n\n`;

    for (const category in handbookCategories) {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      llmsContent += `### ${categoryName}\n\n`;

      const sortedHandbooks = handbookCategories[category].sort((a, b) => {
        const orderA = a.data.sidebar?.order || 999;
        const orderB = b.data.sidebar?.order || 999;
        return orderA - orderB;
      });

      for (const handbook of sortedHandbooks) {
        llmsContent += `#### ${handbook.data.title}\n\n`;
        llmsContent += `URL: ${buildUrl(handbook.id, 'handbook')}\n\n`;

        if (handbook.data.description) {
          llmsContent += `Description: ${handbook.data.description}\n\n`;
        }

        if (handbook.data.readingTime) {
          llmsContent += `Reading Time: ${handbook.data.readingTime}\n\n`;
        }

        if (handbook.data.lastModified) {
          llmsContent += `Updated: ${handbook.data.lastModified}\n\n`;
        }

        if (handbook.data.authors) {
          llmsContent += `Authors: ${handbook.data.authors}\n\n`;
        }

        try {
          llmsContent += cleanContent(handbook.body) + '\n\n';
        } catch (error) {
          llmsContent += `[Content processing error: ${error}]\n\n`;
        }
        llmsContent += '---\n\n';
      }
    }

    return new Response(llmsContent, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Failed to generate llms-full.txt:', error);
    return new Response(`Error generating llms-full.txt: ${error}`, { status: 500 });
  }
};
