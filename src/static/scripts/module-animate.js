// Scroll-driven reveal animations: section divider lines, blueprint-grid
// graphics, module border wipes (cued by the sticky ModuleConnector bar),
// and the CLI-style eyebrow typeout. Each observer fires once per element.

const REVEAL_OFFSET_PX = 400;
const REVEAL_DELAY_MS = 150;
const CHAR_TYPE_MS = 45;

function initSectionLabels() {
  const labels = document.querySelectorAll('.section-label, .mission-label, .text-highlight');
  for (const label of Array.from(labels)) {
    let done = false;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !done) {
          done = true;
          label.classList.add('highlight-animate');
          obs.unobserve(label);
        }
      },
      { threshold: 0.8 }
    );
    obs.observe(label);
  }
}

// Section divider lines — draw in once each line scrolls ~400px into view,
// with a short delay so the build-in is noticeable rather than instant.
function initSectionLines() {
  const lines = document.querySelectorAll('.section-line, .section-line-h');
  for (const line of Array.from(lines)) {
    const offset = parseInt(line.dataset.revealOffset, 10) || REVEAL_OFFSET_PX;
    let done = false;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !done) {
          done = true;
          obs.unobserve(line);
          setTimeout(() => line.classList.add('is-inview'), REVEAL_DELAY_MS);
        }
      },
      { threshold: 0, rootMargin: `0px 0px -${offset}px 0px` }
    );
    obs.observe(line);
  }
}

// Blueprint-grid graphics (hero, next-row, pre-footer) — lines draw in,
// then accent squares pop, then any content panel fades in on top.
function initLineDrawGraphics() {
  const PATH_STEP_MS = 55;
  const NODE_STEP_MS = 70;
  const GROUP_GAP_MS = 120;

  const graphics = document.querySelectorAll('.line-draw');
  for (const graphic of Array.from(graphics)) {
    let done = false;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done) return;
        done = true;
        obs.unobserve(graphic);

        const paths = Array.from(graphic.querySelectorAll('path[data-line-draw]'));
        const nodes = Array.from(graphic.querySelectorAll('rect[data-line-draw]'));
        const panel = graphic.querySelector('[data-line-draw-panel]');

        paths.forEach((el, i) => setTimeout(() => el.classList.add('is-inview'), i * PATH_STEP_MS));

        const nodesStart = paths.length * PATH_STEP_MS + GROUP_GAP_MS;
        nodes.forEach((el, i) =>
          setTimeout(() => el.classList.add('is-inview'), nodesStart + i * NODE_STEP_MS)
        );

        if (panel) {
          const panelStart = nodesStart + nodes.length * NODE_STEP_MS + GROUP_GAP_MS;
          setTimeout(() => panel.classList.add('is-inview'), panelStart);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(graphic);
  }
}

// Module border wipe — fires exactly when a module's top edge crosses the
// top of the viewport, i.e. when the sticky ModuleConnector bar visually
// reaches that module (see components-module-animate.css).
function initModuleBorderWipe() {
  const modules = document.querySelectorAll('[data-module-wipe]');
  for (const module of Array.from(modules)) {
    const wipe = module.querySelector('.module-border-wipe');
    if (!wipe) continue;
    let done = false;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !done) {
          done = true;
          wipe.classList.add('is-inview');
          obs.unobserve(module);
        }
      },
      { threshold: 0, rootMargin: '-1px 0px -99% 0px' }
    );
    obs.observe(module);
  }
}

// Eyebrow typeout — the coloured cursor square "types" the eyebrow text
// character by character, then returns to its resting position on the left.
// The full text stays in the DOM throughout (only visually clipped), so
// accessibility and SEO are unaffected.
function initEyebrowTypeout() {
  const eyebrows = document.querySelectorAll('[data-eyebrow-typeout]');
  for (const eyebrow of Array.from(eyebrows)) {
    const text = eyebrow.querySelector('.section-eyebrow-text');
    const cursor = eyebrow.querySelector('.section-eyebrow-cursor');
    if (!text || !cursor) continue;

    const chars = Math.max((text.textContent || '').trim().length, 1);
    const offset = parseInt(eyebrow.dataset.revealOffset, 10) || REVEAL_OFFSET_PX;

    eyebrow.style.setProperty('--eyebrow-chars', String(chars));
    eyebrow.style.setProperty('--eyebrow-type-ms', `${chars * CHAR_TYPE_MS}ms`);

    let done = false;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !done) {
          done = true;
          obs.unobserve(eyebrow);
          setTimeout(() => {
            eyebrow.classList.add('is-typing');
            text.addEventListener('transitionend', () => eyebrow.classList.add('is-typed'), {
              once: true,
            });
          }, REVEAL_DELAY_MS);
        }
      },
      { threshold: 0, rootMargin: `0px 0px -${offset}px 0px` }
    );
    obs.observe(eyebrow);
  }
}

function initModuleAnimate() {
  initSectionLabels();
  initSectionLines();
  initLineDrawGraphics();
  initModuleBorderWipe();
  initEyebrowTypeout();
}

document.addEventListener('DOMContentLoaded', initModuleAnimate);

// Handle page restoration from bfcache (back/forward navigation)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    setTimeout(initModuleAnimate, 10);
  }
});

// Handle navigation with history API (back/forward)
window.addEventListener('popstate', () => {
  setTimeout(initModuleAnimate, 10);
});
