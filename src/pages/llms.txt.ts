import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from 'astro:config/client';
import { extractDescription, buildUrl, stripHtml } from '@utils/llmsUtils';
import { fetchStrapiArticles } from '@libs/strapi';

export const GET: APIRoute = async () => {
  try {
    // Get project info
    const siteUrl = site;

    // Base structure for llms.txt
    let llmsContent = `# Datum\n\n`;
    llmsContent += `## About\n\n`;
    llmsContent += `> Datum is an open source network cloud for AI, founded in 2024 and backed by $13.6M from Amplify Partners, CRV, Encoded Ventures, Cervin Ventures, Ex/Ante, Step Function, and Vine Ventures. Built for AI-native developers and alternative cloud providers, Datum provides an Envoy-based AI Edge across 17+ global regions, QUIC-based secure tunnels (Connectors), authoritative DNS, and programmatic domain management — all with a forever-free Builder tier. Core platform licensed AGPLv3. Founded by Zac Smith (ex-Equinix, Packet) and Jacob Smith.\n\n`;

    // Get all pages sorted, excluding home/* pages
    const pages = await getCollection('pages');
    const filteredPages = pages.filter((page) => !page.id.startsWith('home/'));
    const sortedPages = filteredPages.sort((a, b) => (a.data.order || 999) - (b.data.order || 999));

    llmsContent += `## Pages\n\n`;

    for (const page of sortedPages) {
      const description: string =
        page.data.description || extractDescription(page.body, 'No description available');
      const pageUrl = buildUrl(page.id);
      const pageTitle = stripHtml(page.data.title);
      llmsContent += `- [${pageTitle}](${pageUrl}) - ${description}\n`;
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

    llmsContent += `\n## Docs\n\n`;
    llmsContent += `- Full documentation index at ${siteUrl}/docs/llms.txt\n`;

    llmsContent += `\n## MCP\n\n`;
    llmsContent += `- [Datum Docs MCP](${siteUrl}/docs/mcp) - MCP server for AI agents to search and read Datum documentation (JSON-RPC 2.0 over SSE). Tools: \`search_datum_cloud_docs\`, \`query_docs_filesystem_datum_cloud_docs\`.\n`;

    llmsContent += `\n## Optional\n\n`;
    llmsContent += `- Full site content at ${siteUrl}/llms-full.txt\n`;
    llmsContent += `- Full documentation content at ${siteUrl}/docs/llms-full.txt\n`;

    // Return the response as plain text
    return new Response(llmsContent, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Failed to generate llms.txt:', error);
    return new Response('Error generating llms.txt', { status: 500 });
  }
};
