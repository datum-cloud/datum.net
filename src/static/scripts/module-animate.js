// Scroll-driven reveal animations: section divider lines, blueprint-grid
// "glass" graphics, module border wipes, and the CLI-style eyebrow typeout.
// Every reveal reverses when its element scrolls back out of view (either
// direction), so scrolling back down replays it.

const REVEAL_OFFSET_PX = 150;
const REVEAL_DELAY_MS = 150;
const CHAR_TYPE_MS = 45;
// Shared by the module border wipe and the blueprint-grid "glass" graphics —
// both are cued by the sticky ModuleConnector bar, so both fire this many
// pixels before their module's top edge reaches the top of the viewport,
// giving their transitions time to finish before the bar visually arrives.
const TOUCH_LEAD_PX = 150;

let activeObservers = [];

function trackObserver(obs) {
  activeObservers.push(obs);
  return obs;
}

function touchRootMargin() {
  const bottomMargin = Math.max(window.innerHeight - TOUCH_LEAD_PX, 0);
  return `-1px 0px -${bottomMargin}px 0px`;
}

function initSectionLabels() {
  const labels = document.querySelectorAll('.section-label, .mission-label, .text-highlight');
  for (const label of Array.from(labels)) {
    const obs = trackObserver(
      new IntersectionObserver(
        (entries) => {
          label.classList.toggle('highlight-animate', entries[0].isIntersecting);
        },
        { threshold: 0.3 }
      )
    );
    obs.observe(label);
  }
}

// Section divider lines — draw in once each line scrolls REVEAL_OFFSET_PX
// into view, with a short delay so the build-in is noticeable rather than
// instant. Reverses (cancelling any pending delayed reveal) on scroll-up.
function initSectionLines() {
  const lines = document.querySelectorAll('.section-line, .section-line-h');
  for (const line of Array.from(lines)) {
    const offset = parseInt(line.dataset.revealOffset, 10) || REVEAL_OFFSET_PX;
    let timeoutId = null;
    const obs = trackObserver(
      new IntersectionObserver(
        (entries) => {
          clearTimeout(timeoutId);
          if (entries[0].isIntersecting) {
            timeoutId = setTimeout(() => line.classList.add('is-inview'), REVEAL_DELAY_MS);
          } else {
            line.classList.remove('is-inview');
          }
        },
        { threshold: 0, rootMargin: `0px 0px -${offset}px 0px` }
      )
    );
    obs.observe(line);
  }
}

// Blueprint-grid "glass" graphics (hero, next-row, pre-footer) — lines draw
// in, accent squares pop, then any content panel fades in, cued by the same
// touch-lead as the module border wipe. Reverses on scroll-up.
function initLineDrawGraphics() {
  const PATH_STEP_MS = 55;
  const NODE_STEP_MS = 70;
  const GROUP_GAP_MS = 120;

  const graphics = document.querySelectorAll('.line-draw');
  for (const graphic of Array.from(graphics)) {
    const paths = Array.from(graphic.querySelectorAll('path[data-line-draw]'));
    const nodes = Array.from(graphic.querySelectorAll('rect[data-line-draw]'));
    const panel = graphic.querySelector('[data-line-draw-panel]');
    let timeoutIds = [];

    const obs = trackObserver(
      new IntersectionObserver(
        (entries) => {
          timeoutIds.forEach(clearTimeout);
          timeoutIds = [];

          if (entries[0].isIntersecting) {
            paths.forEach((el, i) =>
              timeoutIds.push(setTimeout(() => el.classList.add('is-inview'), i * PATH_STEP_MS))
            );

            const nodesStart = paths.length * PATH_STEP_MS + GROUP_GAP_MS;
            nodes.forEach((el, i) =>
              timeoutIds.push(
                setTimeout(() => el.classList.add('is-inview'), nodesStart + i * NODE_STEP_MS)
              )
            );

            if (panel) {
              const panelStart = nodesStart + nodes.length * NODE_STEP_MS + GROUP_GAP_MS;
              timeoutIds.push(setTimeout(() => panel.classList.add('is-inview'), panelStart));
            }
          } else {
            paths.forEach((el) => el.classList.remove('is-inview'));
            nodes.forEach((el) => el.classList.remove('is-inview'));
            if (panel) panel.classList.remove('is-inview');
          }
        },
        { threshold: 0, rootMargin: touchRootMargin() }
      )
    );
    obs.observe(graphic);
  }
}

// Module border wipe — fires TOUCH_LEAD_PX before a module's top edge
// reaches the top of the viewport, i.e. before the sticky ModuleConnector
// bar visually arrives there. Reverses on scroll-up.
function initModuleBorderWipe() {
  const modules = document.querySelectorAll('[data-module-wipe]');
  for (const module of Array.from(modules)) {
    const wipe = module.querySelector('.module-border-wipe');
    if (!wipe) continue;
    const obs = trackObserver(
      new IntersectionObserver(
        (entries) => {
          wipe.classList.toggle('is-inview', entries[0].isIntersecting);
        },
        { threshold: 0, rootMargin: touchRootMargin() }
      )
    );
    obs.observe(module);
  }
}

// Eyebrow typeout — the coloured cursor square "types" the eyebrow text
// character by character, then returns to its resting position on the left.
// The full text stays in the DOM throughout (only visually clipped), so
// accessibility and SEO are unaffected. Reverses (untyping) on scroll-up.
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

    let timeoutId = null;
    const onTransitionEnd = () => eyebrow.classList.add('is-typed');

    const obs = trackObserver(
      new IntersectionObserver(
        (entries) => {
          clearTimeout(timeoutId);
          text.removeEventListener('transitionend', onTransitionEnd);

          if (entries[0].isIntersecting) {
            timeoutId = setTimeout(() => {
              eyebrow.classList.add('is-typing');
              text.addEventListener('transitionend', onTransitionEnd, { once: true });
            }, REVEAL_DELAY_MS);
          } else {
            eyebrow.classList.remove('is-typing', 'is-typed');
          }
        },
        { threshold: 0, rootMargin: `0px 0px -${offset}px 0px` }
      )
    );
    obs.observe(eyebrow);
  }
}

function initModuleAnimate() {
  activeObservers.forEach((obs) => obs.disconnect());
  activeObservers = [];

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
