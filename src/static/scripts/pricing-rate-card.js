// Geometry glue for the /pricing rate card. The pinned header and the category
// rail both sit outside the horizontally scrolled body, so they need its
// scrollLeft mirrored onto them; the rail additionally needs each group's box
// copied over, after which CSS sticky handles every scroll frame itself.

let teardowns = [];

function initRateCard(card) {
  const body = card.querySelector('[data-rate-card-body]');
  const inner = card.querySelector('[data-rate-card-inner]');
  const head = card.querySelector('[data-rate-card-head]');
  const headBar = card.querySelector('[data-rate-card-headbar]');
  const rail = card.querySelector('[data-rate-card-rail]');
  const railTrack = card.querySelector('[data-rate-card-rail-track]');
  if (!body || !inner || !head || !headBar || !rail || !railTrack) return;

  const cells = Array.from(card.querySelectorAll('[data-rate-card-category-cell]'));
  const groups = Array.from(railTrack.querySelectorAll('[data-rate-card-rail-group]'));
  if (!cells.length || cells.length !== groups.length) return;

  let scrollRaf = 0;

  const syncX = () => {
    scrollRaf = 0;
    const offset = `translate3d(${-body.scrollLeft}px, 0, 0)`;
    head.style.transform = offset;
    railTrack.style.transform = offset;
  };

  const scheduleX = () => {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(syncX);
  };

  const measure = () => {
    const cardTop = card.getBoundingClientRect().top;
    const padTop = parseFloat(getComputedStyle(cells[0]).paddingTop);
    const boxes = cells.map((cell) => cell.getBoundingClientRect());

    railTrack.style.width = `${inner.offsetWidth}px`;
    rail.style.setProperty('--pricing-rail-top', `${headBar.offsetHeight + padTop}px`);

    boxes.forEach((box, index) => {
      groups[index].style.top = `${box.top - cardTop}px`;
      groups[index].style.height = `${box.height}px`;
    });

    rail.setAttribute('data-ready', '');
  };

  const observer = new ResizeObserver(measure);
  observer.observe(inner);
  body.addEventListener('scroll', scheduleX, { passive: true });

  teardowns.push(() => {
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    observer.disconnect();
    body.removeEventListener('scroll', scheduleX);
    head.style.transform = '';
    railTrack.style.transform = '';
    rail.removeAttribute('data-ready');
  });

  syncX();
  measure();
}

function initRateCards() {
  for (const teardown of teardowns) teardown();
  teardowns = [];

  for (const card of Array.from(document.querySelectorAll('[data-rate-card]'))) {
    initRateCard(card);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRateCards);
} else {
  initRateCards();
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted) setTimeout(initRateCards, 10);
});

window.addEventListener('popstate', () => setTimeout(initRateCards, 10));
