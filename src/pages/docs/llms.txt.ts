import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from 'astro:config/client';
import { extractDescription, cleanContent, buildDocsUrl } from '@utils/llmsUtils';

export const GET: APIRoute = async () => {
  try {
    const siteUrl = site;

    // Base structure for docs llms.txt
    let llmsContent = `# Datum Cloud Documentation\n\n`;
    llmsContent += `> This file is optimized for LLMs to understand our documentation.\n\n`;
    llmsContent += `## About\n\n`;
    llmsContent += `Datum provides enterprise-grade cloud network solutions. This document contains comprehensive documentation for developers and operators.\n\n`;
    llmsContent += `For the full site content including blog posts and handbook, see: ${siteUrl}/llms.txt\n\n`;

    // Get all Docs entries
    const docs = await getCollection('docs');

    if (docs.length === 0) {
      llmsContent += `No documentation entries found.\n`;
      return new Response(llmsContent, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Group docs by top-level category
    const docCategories: { [key: string]: typeof docs } = {};

    docs.forEach((doc) => {
      const parts = doc.id.split('/');
      const category = parts.length > 1 ? parts[0] : 'general';
      if (!docCategories[category]) {
        docCategories[category] = [];
      }
      docCategories[category].push(doc);
    });

    // Add table of contents
    llmsContent += `## Table of Contents\n\n`;

    for (const category in docCategories) {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
      llmsContent += `- [${categoryName}](#${category})\n`;
      for (const doc of docCategories[category]) {
        const description = doc.data.description || extractDescription(doc.body, '');
        const docUrl = buildDocsUrl(doc.id);
        llmsContent += description
          ? `  - [${doc.data.title}](${docUrl}) - ${description}\n`
          : `  - [${doc.data.title}](${docUrl})\n`;
      }
    }

    // Add full content
    llmsContent += '\n\n---\n\n';
    llmsContent += `# Full Documentation Content\n\n`;

    for (const category in docCategories) {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
      llmsContent += `## ${categoryName}\n\n`;

      // Sort docs by sidebar order if available
      const sortedDocs = docCategories[category].sort((a, b) => {
        const orderA = a.data.sidebar?.order || 999;
        const orderB = b.data.sidebar?.order || 999;
        return orderA - orderB;
      });

      for (const doc of sortedDocs) {
        llmsContent += `### ${doc.data.title}\n\n`;
        llmsContent += `URL: ${buildDocsUrl(doc.id)}\n\n`;

        if (doc.data.description) {
          llmsContent += `Description: ${doc.data.description}\n\n`;
        }

        try {
          llmsContent += cleanContent(doc.body) + '\n\n';
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
    console.error('Failed to generate docs/llms.txt:', error);
    return new Response(`Error generating docs/llms.txt: ${error}`, { status: 500 });
  }
};
