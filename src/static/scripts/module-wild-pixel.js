// src/static/scripts/module-wild-pixel.js

const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';
const BAND = 80;
const BLOCK = 16;
// How far the photo travels through the band before the pixels are fully on.
const FADE = 80;

let teardown = null;

/**
 * Bottom of the site header, or 0 once it has scrolled away.
 * @returns {number}
 */
function headerBottom() {
  const header = document.querySelector('.hero--main');
  if (!header) return 0;
  return header.getBoundingClientRect().bottom;
}

/**
 * @param {HTMLElement} media
 * @returns {{ paint: () => void, destroy: () => void }}
 */
function bind(media) {
  const img = media.querySelector('img');
  const canvas = document.createElement('canvas');
  canvas.className = 'wild-pixel-strip';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: false });

  const hide = () => {
    canvas.classList.remove('is-on');
  };

  const paint = () => {
    if (!img || !ctx || !img.naturalWidth || !img.naturalHeight) {
      hide();
      return;
    }

    const rect = media.getBoundingClientRect();
    const bandTop = Math.max(0, headerBottom());
    const overlapBottom = Math.min(rect.bottom, bandTop + BAND);
    const cssHeight = overlapBottom - bandTop;

    // The photo stays sharp until its top edge reaches the band.
    if (rect.top > bandTop || cssHeight <= 0 || rect.width <= 0 || rect.height <= 0) {
      hide();
      return;
    }

    const entered = bandTop - rect.top;
    const remaining = rect.bottom - bandTop;
    const t = Math.min(1, Math.max(0, Math.min(entered, remaining) / FADE));
    // Smoothstep so the grain eases in instead of popping on.
    const reveal = t * t * (3 - 2 * t);
    const block = 1 + (BLOCK - 1) * reveal;

    const cw = Math.max(1, Math.round(rect.width / block));
    const ch = Math.max(1, Math.round(cssHeight / block));
    if (canvas.width !== cw) canvas.width = cw;
    if (canvas.height !== ch) canvas.height = ch;

    const srcY = Math.max(0, ((bandTop - rect.top) / rect.height) * img.naturalHeight);
    const srcH = Math.min(img.naturalHeight - srcY, (cssHeight / rect.height) * img.naturalHeight);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, srcY, img.naturalWidth, srcH, 0, 0, cw, ch);

    canvas.style.top = `${bandTop}px`;
    canvas.style.left = `${rect.left}px`;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.style.opacity = reveal.toFixed(3);
    canvas.classList.add('is-on');
  };

  return {
    paint,
    destroy: () => canvas.remove(),
  };
}

function init() {
  if (teardown) teardown();
  teardown = null;

  const medias = document.querySelectorAll('[data-wild-pixel]');
  if (!medias.length || !window.matchMedia(MOTION_QUERY).matches) return;

  const strips = Array.from(medias, bind);
  let frame = 0;

  const update = () => {
    frame = 0;
    strips.forEach((strip) => strip.paint());
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  const onLoad = schedule;
  medias.forEach((media) => {
    media.querySelector('img')?.addEventListener('load', onLoad);
  });

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();

  teardown = () => {
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    medias.forEach((media) => {
      media.querySelector('img')?.removeEventListener('load', onLoad);
    });
    strips.forEach((strip) => strip.destroy());
  };
}

const motionQuery = window.matchMedia(MOTION_QUERY);
motionQuery.addEventListener('change', init);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted) init();
});
