// src/plugins/rehypeMermaid.ts
import type { Element, Root } from 'hast';

const MERMAID_LANGUAGE_CLASS = 'language-mermaid';

const visitElements = (node: Root | Element, visit: (element: Element) => void): void => {
  for (const child of node.children) {
    if (child.type !== 'element') continue;
    visit(child);
    visitElements(child, visit);
  }
};

const isMermaidCode = (element: Element | undefined): element is Element => {
  const className = element?.properties?.className;
  return (
    element?.tagName === 'code' &&
    Array.isArray(className) &&
    className.includes(MERMAID_LANGUAGE_CLASS)
  );
};

/**
 * Turns ```mermaid fences into `<pre class="mermaid">`, the markup the
 * astro-mermaid client script renders. Strapi article bodies bypass Astro's
 * markdown pipeline, where astro-mermaid does this itself. Runs before
 * rehype-expressive-code so the fence is not styled as a code block.
 * @returns Rehype transformer
 */
export const rehypeMermaid = () => (tree: Root) => {
  visitElements(tree, (element) => {
    if (element.tagName !== 'pre') return;

    const code = element.children.find((child): child is Element => child.type === 'element');
    if (!isMermaidCode(code)) return;

    element.properties = { className: ['mermaid'] };
    element.children = code.children;
  });
};
