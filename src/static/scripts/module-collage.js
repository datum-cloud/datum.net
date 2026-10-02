// src/static/scripts/module-collage.js
// Scroll-scrubbed progress for the /about founding-insight collage.
//
// The section is a tall track with a sticky, viewport-high stage inside it
// (see components-about.css). The photos stay put until the stage fills the
// screen, then progress runs from 0 to 1 over the track's extra scroll length:
// the longer that run, the slower the photos move. Progress is written as
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

function bind(section) {
  let frame = 0;

  const stage = section.querySelector('.about-collage-stage');

  const update = () => {
    frame = 0;
    if (!stage) return;
    const rect = section.getBoundingClientRect();
    // The stage pins at `pinTop` (negative when the canvas is taller than the
    // viewport), so progress starts the moment the section reaches that point.
    const pinTop = Math.min(0, window.innerHeight - stage.offsetHeight);
    const run = rect.height - stage.offsetHeight;
    const progress = run > 0 ? clamp((pinTop - rect.top) / run) : 1;
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
