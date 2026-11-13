import {
  C,
  SW,
  text,
  tag,
  label,
  badge,
  ext,
  datum,
  tile,
  extFrame,
  line,
  deco,
  svg,
} from '../kit.mjs';

const mono = (x, y, s, o = {}) => text(x, y, s, { mono: true, size: 12.5, fill: C.muted, ...o });

// direct UDP vs relay: both paths tried in parallel, fastest wins
export const pathsDirectRelay = () => {
  const W = 1140,
    H = 600;
  let b = '';
  b += deco(6, 1000, 470, 150);
  b += extFrame(30, 30, 1080, 520, 'Two paths between endpoints, tried in parallel');
  // endpoints
  b +=
    tile(190, 150, 230, 250) +
    datum(190, 255, 'hub', { r: 46 }) +
    text(190, 345, 'Gateway', { size: 17, weight: 500 }) +
    text(190, 368, 'endpoint', { size: 15, fill: C.muted });
  b +=
    tile(950, 150, 230, 250) +
    datum(950, 255, 'laptop', { r: 46 }) +
    text(950, 345, 'Desktop', { size: 17, weight: 500 }) +
    text(950, 368, 'node', { size: 15, fill: C.muted });
  // direct path (top)
  b += line(
    [
      [310, 215],
      [830, 215],
    ],
    'ok',
    { both: true }
  );
  b += tag(570, 215, 'Direct UDP · hole-punched', { fill: C.pine });
  // relay path (bottom) through the home relay
  b +=
    tile(570, 340, 210, 130) +
    datum(570, 392, 'cloud', { r: 30 }) +
    text(570, 450, 'Home relay', { size: 15, weight: 500 });
  b += line(
    [
      [310, 385],
      [458, 385],
    ],
    'neutral',
    { both: true }
  );
  b += line(
    [
      [682, 385],
      [830, 385],
    ],
    'neutral',
    { both: true }
  );
  b += tag(384, 363, 'encrypted', { fill: C.ink }) + tag(756, 363, 'encrypted', { fill: C.ink });
  // outcome
  b += `<g><rect x="260" y="480" width="620" height="44" fill="${C.mossPale}" stroke="${C.pine}" stroke-width="${SW}"/>${text(570, 508, 'both paths tried in parallel · fastest wins, automatic failover', { size: 15, weight: 500, fill: C.navy })}</g>`;
  return svg(W, H, b);
};

// request flow: Envoy -> iroh-gateway -> Desktop node
export const requestFlow = () => {
  const W = 1140,
    H = 900;
  let b = '';
  b += deco(4, 1050, -90, 150);
  const cols = [
    [210, 'Envoy', 'ext'],
    [570, 'iroh-gateway', 'datum'],
    [930, 'Desktop node', 'datum'],
  ];
  for (const [x, name, kind] of cols) {
    b += `<line x1="${x}" y1="150" x2="${x}" y2="860" stroke="${C.line}" stroke-width="${SW}" stroke-dasharray="3 5"/>`;
    if (kind === 'datum') b += tile(x, 40, 210, 100) + text(x, 98, name, { size: 17, weight: 500 });
    else
      b += `<g><rect x="${x - 105}" y="40" width="210" height="100" fill="${C.panel}" stroke="${C.line}" stroke-width="${SW}"/>${text(x, 98, name, { size: 17, weight: 500, fill: C.slate })}</g>`;
  }
  const step = (n, x1, x2, y, t, note, kind = 'neutral', fill) => {
    const cx = (x1 + x2) / 2;
    const tagHalf = (t.length * 11 * 0.62 + 18) / 2;
    let s =
      line(
        [
          [x1, y],
          [x2, y],
        ],
        kind
      ) +
      tag(cx, y - 24, t, { fill: fill ?? C.ink }) +
      badge(cx - tagHalf - 20, y - 24, n);
    if (note) s += text(cx, y + 26, note, { size: 14, fill: C.muted });
    return s;
  };
  b += step(1, 215, 565, 230, 'HTTP request', '(via Unix socket)');
  b += step(2, 575, 925, 340, 'resolve endpoint ID', 'from request metadata');
  b += step(3, 575, 925, 470, 'open QUIC stream', '(reuse connection or establish new one)');
  b += step(4, 575, 925, 600, 'forward request', 'over QUIC stream', 'ok', C.pine);
  b += step(5, 925, 575, 730, 'HTTP response', null, 'neutral');
  b += step(6, 565, 215, 810, 'HTTP response', null, 'neutral');
  return svg(W, H, b);
};
