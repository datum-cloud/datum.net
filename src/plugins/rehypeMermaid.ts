// src/plugins/rehypeMermaid.ts
import type { Element, ElementContent, Root, RootContent } from 'hast';

const MERMAID_LANGUAGE_CLASS = 'language-mermaid';

const isMermaidCode = (element: Element | undefined): element is Element => {
  const className = element?.properties?.className;
  return (
    element?.tagName === 'code' &&
    Array.isArray(className) &&
    className.includes(MERMAID_LANGUAGE_CLASS)
  );
};

const textContent = (node: ElementContent): string =>
  node.type === 'text'
    ? node.value
    : node.type === 'element'
      ? node.children.map(textContent).join('')
      : '';

const isTag = (node: ElementContent | RootContent, tagName: string): node is Element =>
  node.type === 'element' && node.tagName === tagName;

/**
 * A standalone markdown image: a `<p>` holding only an `<img>`, or the `<figure>` that
 * transformMarkdownFigures() produces (an `<img>` plus an optional `<figcaption>`).
 */
const isImageBlock = (element: RootContent | undefined): element is Element => {
  if (!element || !(isTag(element, 'p') || isTag(element, 'figure'))) return false;
  const hasImage = element.children.some((child) => isTag(child, 'img'));
  const onlyImageAndCaption = element.children.every(
    (child) =>
      isTag(child, 'img') ||
      isTag(child, 'figcaption') ||
      (child.type === 'text' && !child.value.trim())
  );
  return hasImage && onlyImageAndCaption;
};

const el = (
  tagName: string,
  properties: Element['properties'],
  children: ElementContent[] = []
): Element => ({ type: 'element', tagName, properties, children });

const tabButton = (id: string, label: string, selected: boolean): Element =>
  el(
    'button',
    {
      type: 'button',
      role: 'tab',
      className: ['diagram-tab'],
      ariaSelected: selected ? 'true' : 'false',
      dataTab: id,
    },
    [{ type: 'text', value: label }]
  );

/**
 * Wraps a designed image and its Mermaid version in an "Illustrated | Mermaid"
 * tab set. The image is shown first; the Mermaid panel stays rendered but
 * hidden (see components-diagram-tabs.css) until its tab is chosen. The Mermaid
 * source is kept on the wrapper so the "Copy Mermaid" button can offer it.
 */
const diagramTabs = (image: Element, mermaid: Element, source: string): Element => {
  // The caption describes the diagram, not one version of it, so it sits under both panels.
  const caption = image.children.find((child): child is Element => isTag(child, 'figcaption'));
  const imageOnly: Element = {
    ...image,
    children: image.children.filter((child) => child !== caption),
  };
  return el(
    'div',
    { className: ['diagram-tabs'], dataDiagramTabs: '', dataSource: source, dataActive: 'image' },
    [
      el('div', { className: ['diagram-tabs-bar'] }, [
        el(
          'div',
          { className: ['diagram-tabs-list'], role: 'tablist', ariaLabel: 'Diagram version' },
          [tabButton('image', 'Illustrated', true), tabButton('mermaid', 'Mermaid', false)]
        ),
        el('button', { type: 'button', className: ['diagram-tabs-copy'], dataCopy: '' }, [
          { type: 'text', value: 'Copy Mermaid' },
        ]),
      ]),
      el('div', { className: ['diagram-tabs-panel'], role: 'tabpanel', dataPanel: 'image' }, [
        imageOnly,
      ]),
      el(
        'div',
        {
          className: ['diagram-tabs-panel', 'is-inactive'],
          role: 'tabpanel',
          dataPanel: 'mermaid',
        },
        [mermaid]
      ),
      ...(caption
        ? [el('figcaption', { className: ['diagram-tabs-caption'] }, caption.children)]
        : []),
    ]
  );
};

const transform = (node: Root | Element): void => {
  for (let i = 0; i < node.children.length; i += 1) {
    const child = node.children[i];
    if (child.type !== 'element') continue;

    if (child.tagName === 'pre') {
      const code = child.children.find((c): c is Element => c.type === 'element');
      if (isMermaidCode(code)) {
        const source = code.children.map(textContent).join('').trim();
        child.properties = { className: ['mermaid'] };
        child.children = code.children;

        // A mermaid fence right after a standalone image becomes that image's alternate version.
        let prev = i - 1;
        while (prev >= 0 && node.children[prev].type === 'text') prev -= 1;
        const before = node.children[prev];
        if (isImageBlock(before)) {
          node.children.splice(prev, i - prev + 1, diagramTabs(before, child, source));
          i = prev;
        }
        continue;
      }
    }
    transform(child);
  }
};

/**
 * Turns ```mermaid fences into `<pre class="mermaid">`, the markup the
 * astro-mermaid client script renders. Strapi article bodies bypass Astro's
 * markdown pipeline, where astro-mermaid does this itself. Runs before
 * rehype-expressive-code so the fence is not styled as a code block.
 * @returns Rehype transformer
 */
export const rehypeMermaid = () => (tree: Root) => transform(tree);
