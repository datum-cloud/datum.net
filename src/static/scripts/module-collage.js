// src/static/scripts/module-collage.js
// Scroll-scrubbed progress for the /about founding-insight collage.
//
// Nothing is pinned: the section is as tall as the design canvas and this maps
// where it sits in the viewport to progress. 0 while the photo row is just
// entering from the bottom edge, 1 once the section is vertically centred, so
// tall screens get no dead space above or below it. Progress is written as
// three CSS custom properties on the [data-collage] element:
//   --p   overall progress            (drives the copy's opacity)
//   --p1  start -> mid  (first half)  (photos leave the overlapping row)
//   --p2  mid   -> end  (second half) (photos clear the copy)
// components-about.css turns those into positions, so this file never touches
// layout. It only runs where the animated layout applies (desktop, no reduced
// motion); elsewhere the CSS renders a static stack and the properties stay at
// their defaults.

const ANIMATED_QUERY = '(min-width: 64rem) and (prefers-reduced-motion: no-preference)';

const clamp = (value) => Math.min(1, Math.max(0, value));

let teardown = null;

// Share of the section's height covered by the starting photo row's bottom edge
// (the row spans 33%-67% of the 890px canvas); progress starts when that edge
// reaches the bottom of the viewport.
const ROW_BOTTOM = 0.67;

function bind(section) {
  let frame = 0;

  const update = () => {
    frame = 0;
    const rect = section.getBoundingClientRect();
    const viewport = window.innerHeight;
    // On tall screens the section can already be past that point at scroll 0;
    // start from wherever it sits on load then, so the starting row is always
    // seen before the photos move.
    const startTop = Math.min(viewport - rect.height * ROW_BOTTOM, rect.top + window.scrollY);
    const endTop = (viewport - rect.height) / 2;
    const distance = startTop - endTop;
    const progress = distance > 0 ? clamp((startTop - rect.top) / distance) : 1;
    section.style.setProperty('--p', progress.toFixed(4));
    section.style.setProperty('--p1', clamp(progress * 2).toFixed(4));
    section.style.setProperty('--p2', clamp(progress * 2 - 1).toFixed(4));
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    ['--p', '--p1', '--p2'].forEach((name) => section.style.removeProperty(name));
  };
}

function init() {
  if (teardown) teardown();
  teardown = null;

  const sections = document.querySelectorAll('[data-collage]');
  if (!sections.length || !window.matchMedia(ANIMATED_QUERY).matches) return;

  const unbinders = Array.from(sections, bind);
  teardown = () => unbinders.forEach((unbind) => unbind());
}

const query = window.matchMedia(ANIMATED_QUERY);
query.addEventListener('change', init);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Restore the right progress after back/forward cache navigation.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) init();
});
