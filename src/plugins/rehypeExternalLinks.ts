// src/plugins/rehypeExternalLinks.ts
import type { Element, Root } from 'hast';
import { isExternalHref } from '@utils/urlUtils';

const visitElements = (node: Root | Element, visit: (element: Element) => void): void => {
  for (const child of node.children) {
    if (child.type !== 'element') continue;
    visit(child);
    visitElements(child, visit);
  }
};

const relTokens = (rel: Element['properties'][string] | undefined): string[] => {
  if (Array.isArray(rel)) return rel.map(String);
  if (typeof rel === 'string') return rel.split(/\s+/);
  return [];
};

/**
 * Opens non-datum.net links in a new tab.
 * @returns Rehype transformer
 */
export const rehypeExternalLinks = () => (tree: Root) => {
  visitElements(tree, (element) => {
    if (element.tagName !== 'a') return;

    const href = element.properties?.href;
    if (typeof href !== 'string' || !isExternalHref(href)) return;

    const rel = new Set(relTokens(element.properties.rel).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');

    element.properties.target = '_blank';
    element.properties.rel = [...rel];
  });
};
