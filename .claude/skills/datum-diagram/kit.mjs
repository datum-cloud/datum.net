import fs from 'node:fs';
// Brand diagram kit: builds SVG strings from the Datum diagram guide (Components / Complex / Simple).
export const C = {
  navy: '#0c1d31', ink: '#223143', slate: '#384555', moss: '#e6f59f', mossPale: '#f3f8dd', pine: '#4d6356',
  clay: '#bf9595', clayPale: '#f5e8e8', clayDeep: '#815e5e', line: '#c4c6c9', lineDark: '#9aa0a6', panel: '#f6f6f5', muted: '#6a7282', white: '#fff',
};
export const SW = 1.5; // one line weight for the whole diagram
const SANS = "'Alliance No.1', Inter, sans-serif";
const MONO = "'DejaVu Sans Mono', Menlo, monospace";

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const text = (x, y, s, o = {}) => {
  const { size = 15, anchor = 'middle', weight = 400, mono = false, fill = C.navy, ls = 0, italic = false } = o;
  const lines = Array.isArray(s) ? s : [s];
  const lh = o.lh ?? size * 1.3;
  const tsp = lines.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${esc(l)}</tspan>`).join('');
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${mono ? MONO : SANS}" font-size="${size}" font-weight="${weight}" fill="${fill}" letter-spacing="${ls}"${italic ? ' font-style="italic"' : ''}>${tsp}</text>`;
};

// dark mono tag, as in the guide's "Cloud CNI" labels
export const tag = (cx, cy, s, o = {}) => {
  const size = o.size ?? 11;
  const w = s.length * size * 0.62 + 18;
  const h = size + 12;
  return `<g><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${o.fill ?? C.ink}"/>${text(cx, cy + size * 0.36, s, { size, mono: true, fill: o.color ?? '#fff', ls: 0.3 })}</g>`;
};

// plain label sitting on a white pad so a line can pass behind it
export const label = (cx, cy, lines, o = {}) => {
  lines = Array.isArray(lines) ? lines : [lines];
  const size = o.size ?? 14;
  const lh = size * 1.35;
  const w = Math.max(...lines.map((l) => l.length)) * size * (o.mono ? 0.62 : 0.5) + 16;
  const h = lines.length * lh + 6;
  const y0 = cy - h / 2;
  return `<g><rect x="${cx - w / 2}" y="${y0}" width="${w}" height="${h}" fill="${o.bg ?? '#fff'}"/>${text(cx, y0 + size + 3, lines, { size, mono: o.mono, fill: o.fill ?? C.muted, lh, weight: o.weight })}</g>`;
};

export const badge = (cx, cy, n, r = 11) =>
  `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.clay}"/>${text(cx, cy + 4.6, String(n), { size: 12.5, fill: '#fff', weight: 500 })}</g>`;

// ---------- icons (24-unit box, outline, consistent stroke) ----------
const ic = (body, color, sw = SW) => `<g fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
export const ICONS = {
  laptop: '<rect x="4" y="5.5" width="16" height="11" rx="1.5"/><path d="M2 19.5h20"/>',
  server: '<rect x="4" y="4" width="16" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="16" height="6.5" rx="1.2"/><circle cx="7.6" cy="7.2" r=".6"/><circle cx="7.6" cy="16.8" r=".6"/>',
  router: '<circle cx="12" cy="12" r="9"/><path d="M12 4.5v5M9.8 6.8 12 9.5l2.2-2.7M12 19.5v-5M9.8 17.2 12 14.5l2.2 2.7M4.5 12h5M6.8 9.8 9.5 12l-2.7 2.2M19.5 12h-5M17.2 9.8 14.5 12l2.7 2.2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M4.5 7.5h15M4.5 16.5h15"/>',
  pin: '<path d="M12 21.5S5 15 5 9.5a7 7 0 0 1 14 0C19 15 12 21.5 12 21.5z"/><circle cx="12" cy="9.5" r="2.6"/>',
  hub: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>',
  case: '<rect x="5" y="8" width="14" height="12" rx="2"/><path d="M9 8V5.5h6V8M9.5 11.5v5M14.5 11.5v5"/>',
  swap: '<path d="M4 8h14M15 4.5 18.5 8 15 11.5M20 16H6M9 12.5 5.5 16 9 19.5"/>',
  cloud: '<path d="M7 18.5a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 9.5a4.5 4.5 0 0 1 .5 9z"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  ship: '<path d="M4 8h16v10H4zM4 12h16"/>',
};
export const icon = (name, cx, cy, size, color = C.ink, sw = SW) =>
  `<g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 24})">${ic(ICONS[name], color, sw)}</g>`;

// ---------- nodes ----------
// external / third-party: grayscale diamond (guide: "resort to a grayscale approach")
export const ext = (cx, cy, name, o = {}) => {
  const r = o.r ?? 46;
  if (DIAMONDS[name]) return asset(DIAMONDS[name], cx, cy, r * 2);
  return `<g><polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${C.line}"/>${icon(name, cx, cy, r * 0.62, C.ink, 2.3)}</g>`;
};
// Datum touchpoint: bright pine disc, light line icon
export const datum = (cx, cy, name, o = {}) => {
  const r = o.r ?? 44;
  return `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.pine}"/>${icon(name, cx, cy, r * 0.66, '#fff', 2)}</g>`;
};
// the stacked-card server illustration from the Components board
export const rack = (cx, cy, o = {}) => asset(38, cx, cy, o.w ?? 150);

// ---------- frames ----------
// Datum frame: thick moss outline + hairline inside (Components board, top-left)
export const datumFrame = (x, y, w, h, title, o = {}) => {
  const hdr = title
    ? `<line x1="${x + 5}" y1="${y + 48}" x2="${x + w - 5}" y2="${y + 48}" stroke="${C.line}" stroke-width="${SW}"/>${text(x + 22, y + 32, title, { size: 17, anchor: 'start', fill: C.navy, weight: 500 })}`
    : '';
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="${C.moss}" stroke-width="10"/><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" fill="#fff" stroke="${C.line}" stroke-width="${SW}"/>${hdr}</g>`;
};
// outer panel: grey hairline with a header strip (the neutral container)
export const extFrame = (x, y, w, h, title) =>
  `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="${C.line}" stroke-width="${SW}"/><rect x="${x}" y="${y}" width="${w}" height="46" fill="${C.panel}" stroke="${C.line}" stroke-width="${SW}"/>${text(x + 22, y + 30, title, { size: 17, anchor: 'start', weight: 500, fill: C.navy })}<rect x="${x}" y="${y + h - 8}" width="${w}" height="8" fill="${C.panel}" stroke="${C.line}" stroke-width="${SW}"/></g>`;
// moss frame wraps only Datum content
export const tile = (cx, y, w, h) =>
  `<g><rect x="${cx - w / 2}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="${C.moss}" stroke-width="8"/><rect x="${cx - w / 2 + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="#fff" stroke="${C.line}" stroke-width="${SW}"/></g>`;

// ---------- lines ----------
const COLORS = { ok: C.pine, neutral: C.ink, bad: C.clay, ret: C.lineDark, link: C.lineDark };
const rpath = (pts, r = 10) => {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i], [ax, ay] = pts[i - 1], [bx, by] = pts[i + 1];
    const da = Math.hypot(ax - px, ay - py), db = Math.hypot(bx - px, by - py);
    const ra = Math.min(r, da / 2), rb = Math.min(r, db / 2);
    d += ` L${px + ((ax - px) / da) * ra} ${py + ((ay - py) / da) * ra} Q${px} ${py} ${px + ((bx - px) / db) * rb} ${py + ((by - py) / db) * rb}`;
  }
  return d + ` L${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
};
const head = (tip, from, color, size = 9) => {
  const [tx, ty] = tip, [fx, fy] = from;
  const d = Math.hypot(tx - fx, ty - fy) || 1;
  const ux = (tx - fx) / d, uy = (ty - fy) / d;
  const bx = tx - ux * size, by = ty - uy * size;
  return `<polygon points="${tx},${ty} ${bx - uy * size * 0.4},${by + ux * size * 0.4} ${bx + uy * size * 0.4},${by - ux * size * 0.4}" fill="${color}"/>`;
};
// kind: ok|neutral|bad|ret|link. dashed by default, solid for 'link'. dot = round start marker. both = arrowheads both ends.
export const line = (pts0, kind = 'neutral', o = {}) => {
  const pts = pts0.filter((p, i) => i === 0 || p[0] !== pts0[i - 1][0] || p[1] !== pts0[i - 1][1]);
  const color = COLORS[kind];
  const dashed = o.solid ? false : kind !== 'link';
  const n = pts.length;
  const arrowEnd = o.arrow !== false && kind !== 'link';
  const trim = (p, q, by) => {
    const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    return [p[0] + ((q[0] - p[0]) / d) * by, p[1] + ((q[1] - p[1]) / d) * by];
  };
  const body = pts.map((p) => [...p]);
  if (arrowEnd) body[n - 1] = trim(pts[n - 1], pts[n - 2], 8);
  if (o.both) body[0] = trim(pts[0], pts[1], 8);
  let out = `<path d="${rpath(body, o.r ?? 10)}" fill="none" stroke="${color}" stroke-width="${SW}"${dashed ? ' stroke-dasharray="5 4"' : ''} stroke-linecap="butt" stroke-linejoin="round"/>`;
  if (arrowEnd) out += head(pts[n - 1], pts[n - 2], color);
  if (o.both) out += head(pts[0], pts[1], color);
  if (o.dot) out += `<circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="5" fill="${C.line}"/>`;
  if (o.dotEnd) out += `<circle cx="${pts[n - 1][0]}" cy="${pts[n - 1][1]}" r="5" fill="${C.line}"/>`;
  return `<g>${out}</g>`;
};

// ---------- simple-diagram brush accents ----------
export const hatch = (x, y, n, dx, dy, len, color = C.moss, w = 5) =>
  `<g stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity=".95">${Array.from({ length: n }, (_, i) => `<path d="M${x + i * dx} ${y + i * dy}l${len} ${len * 0.55}"/>`).join('')}</g>`;
export const swoosh = (d, color = C.clayPale, w = 9) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
export const squares = (x, y) => `<g><rect x="${x}" y="${y}" width="22" height="22" fill="${C.moss}"/><rect x="${x + 20}" y="${y + 24}" width="14" height="14" fill="${C.clayPale}"/></g>`;

export const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>`;

const ASSET_DIR = new URL('./assets/', import.meta.url).pathname;
const dims = (buf) => [buf.readUInt32BE(16), buf.readUInt32BE(20)];
// official diagram components (Components - Diagram export), embedded so the SVG stands alone
export const asset = (n, x, y, w, o = {}) => {
  const buf = fs.readFileSync(ASSET_DIR + n + '.png');
  const [pw, ph] = dims(buf);
  const h = (w * ph) / pw;
  const cx = o.center === false ? x : x - w / 2, cy = o.center === false ? y : y - h / 2;
  return `<image x="${cx}" y="${cy}" width="${w}" height="${h}" opacity="${o.opacity ?? 1}" href="data:image/png;base64,${buf.toString('base64')}"/>`;
};
export const deco = (n, x, y, w) => asset(n, x, y, w, { center: false });
const DIAMONDS = { router: 31, cloud: 24, hub: 25, lock: 26 };

const LOGO_DIR = new URL('./logos/', import.meta.url).pathname;
// original brand logo crops, embedded so the SVG stands alone
export const logo = (cx, cy, name, size = 92) => {
  const b64 = fs.readFileSync(LOGO_DIR + name + '.png').toString('base64');
  return `<image x="${cx - size / 2}" y="${cy - size / 2}" width="${size}" height="${size}" href="data:image/png;base64,${b64}"/>`;
};
