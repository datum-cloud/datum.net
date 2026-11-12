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

const chip = (x, y, w, h, lines, kind = 'ext') => {
  const L = Array.isArray(lines) ? lines : [lines];
  const fill = kind === 'ok' ? C.mossPale : C.panel,
    stroke = kind === 'ok' ? C.pine : C.line;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${SW}"/>${text(x + w / 2, y + h / 2 + 5 - (L.length - 1) * 10, L, { size: 15, lh: 20, fill: kind === 'ok' ? C.navy : C.slate })}</g>`;
};
const note = (x, y, s, o = {}) => text(x, y, s, { size: 14, fill: C.muted, ...o });

// 1 ─ four flavors: who runs what
export const fourFlavors = () => {
  const W = 1240,
    H = 640;
  let b = deco(6, 1130, 520, 130);
  b += extFrame(30, 30, 1180, 560, 'Four flavors: who runs what');
  const colX = [200, 450, 700, 950],
    cw = 235;
  const cols = [
    {
      name: 'Public Cloud',
      sub: 'for sale · multi-tenant',
      cp: ['Datum', 1],
      inf: ['Datum', 1, 'picks hardware,|locations and network paths'],
      best: 'just works, on demand',
    },
    {
      name: 'Dedicated Cloud',
      sub: 'for sale · fully managed',
      cp: ['Datum', 1],
      inf: ['Datum-managed', 1, 'dedicated to you'],
      best: 'control and isolation',
    },
    {
      name: 'Bring Your Own Cloud',
      sub: 'for sale',
      cp: ['Datum', 1],
      inf: ['You', 0, 'your data plane,|your infrastructure'],
      best: 'sovereign or regulated',
    },
    {
      name: 'Open Source',
      sub: 'not for sale · AGPLv3',
      cp: ['You', 0, 'run it yourself'],
      inf: ['You', 0, 'run it yourself'],
      best: 'use it, study it, fix it',
    },
  ];
  b += text(60, 232, 'Control plane', { size: 15, weight: 500, anchor: 'start' });
  b += text(60, 372, 'Infrastructure', { size: 15, weight: 500, anchor: 'start' });
  b += text(60, 372 + 14, 'and data plane', { size: 15, weight: 500, anchor: 'start' });
  b += text(60, 500, 'Good for', { size: 15, weight: 500, anchor: 'start' });
  cols.forEach((c, i) => {
    const x = colX[i];
    b += text(x + cw / 2, 108, c.name, { size: 18, weight: 500 }) + note(x + cw / 2, 132, c.sub);
    const cell = (y, h, [who, datumOwned, sub]) => {
      let s = datumOwned ? tile(x + cw / 2, y, cw, h) : chip(x, y, cw, h, '', 'ext');
      s += text(x + cw / 2, y + h / 2 - (sub ? 4 : -6), who, {
        size: 18,
        weight: 500,
        fill: datumOwned ? C.navy : C.slate,
      });
      if (sub)
        sub.split('|').forEach((l, k) => {
          s += note(x + cw / 2, y + h / 2 + 18 + k * 17, l);
        });
      return s;
    };
    b += cell(185, 100, c.cp.length === 2 ? [...c.cp, null] : c.cp);
    b += cell(325, 120, c.inf.length === 2 ? [...c.inf, null] : c.inf);
    b += text(x + cw / 2, 504, c.best, { size: 15, fill: C.slate });
  });
  return svg(W, H, b);
};

// 2 ─ Galactic VPC: land anything here
export const landAnything = () => {
  const W = 1240,
    H = 660;
  let b = deco(4, 1090, -80, 170);
  b += extFrame(30, 30, 1180, 600, 'Galactic VPC: land anything, on one virtual backbone');
  const left = [
    'MASQUE tunnel',
    'WireGuard peer',
    'Plain old VPN',
    'Layer 2 VLAN',
    'Layer 3 BGP session',
    'NNI to a carrier',
  ];
  b += note(180, 100, 'however the connection arrives', { size: 14 });
  left.forEach((t, i) => {
    const y = 130 + i * 78;
    b +=
      chip(60, y, 240, 52, t) +
      line(
        [
          [300, y + 26],
          [468, y + 26],
        ],
        'neutral'
      );
  });
  b +=
    tile(620, 118, 300, 460) +
    datum(620, 280, 'hub', { r: 56 }) +
    text(620, 385, 'Galactic VPC', { size: 20, weight: 500 }) +
    note(620, 412, 'a virtual meet-me room') +
    note(620, 432, 'and a virtual backbone') +
    note(620, 466, 'built on SRv6', { size: 13 });
  b += note(1060, 100, 'interchangeable providers underneath');
  ['Bare metal, one provider', 'VMs, another provider', 'GPUs, a third provider'].forEach(
    (t, i) => {
      const y = 175 + i * 120;
      b +=
        line(
          [
            [776, y + 26],
            [940, y + 26],
          ],
          'ok'
        ) + chip(948, y, 230, 52, t);
    }
  );
  return svg(W, H, b);
};

// 3 ─ private by default
export const privateByDefault = () => {
  const W = 1240,
    H = 460;
  let b = deco(6, 1110, 330, 120);
  b += extFrame(
    30,
    30,
    1180,
    400,
    'Private by default: nothing is addressable on the public internet'
  );
  const xs = [150, 450, 790, 1080];
  b +=
    ext(xs[0], 220, 'laptop') +
    text(xs[0], 292, 'Docker container', { size: 16, weight: 500 }) +
    note(xs[0], 314, 'or desktop application');
  b +=
    tile(xs[1], 130, 220, 200) +
    datum(xs[1], 215, 'lock', { r: 42 }) +
    text(xs[1], 292, 'Datum Tunnel', { size: 17, weight: 500 }) +
    note(xs[1], 313, 'QUIC · iroh · routes by key');
  b +=
    tile(xs[2], 130, 220, 200) +
    datum(xs[2], 215, 'hub', { r: 42 }) +
    text(xs[2], 292, 'Galactic VPC', { size: 17, weight: 500 }) +
    note(xs[2], 313, 'private backbone');
  b += ext(xs[3], 220, 'cloud') + text(xs[3], 292, 'AWS', { size: 16, weight: 500 });
  b +=
    line(
      [
        [210, 220],
        [336, 220],
      ],
      'neutral'
    ) +
    line(
      [
        [564, 220],
        [676, 220],
      ],
      'ok'
    ) +
    line(
      [
        [904, 220],
        [1022, 220],
      ],
      'ok'
    );
  b +=
    tag(273, 196, 'lands', { fill: C.ink }) +
    tag(620, 196, 'lands', { fill: C.pine }) +
    tag(963, 196, 'routes out', { fill: C.pine });
  b += `<g><rect x="340" y="360" width="560" height="44" fill="${C.mossPale}" stroke="${C.pine}" stroke-width="${SW}"/>${text(620, 388, 'no exposed ports · no overlay to babysit', { size: 15, weight: 500 })}</g>`;
  return svg(W, H, b);
};

// 4 ─ every agent needs an edge, tunnels and a backbone
export const agentThreePieces = () => {
  const W = 1240,
    H = 700;
  let b = deco(3, 20, 560, 100);
  b += extFrame(30, 30, 1180, 640, 'Every agent gets its own private network');
  b +=
    tile(160, 250, 230, 220) +
    datum(160, 330, 'server', { r: 44 }) +
    text(160, 415, 'Your agent', { size: 18, weight: 500 }) +
    note(160, 438, 'and its workloads');
  const rows = [
    {
      y: 105,
      n: 1,
      t: 'Edge',
      d: ['Envoy proxy meets the internet at scale', 'protection from bots, threats and DDoS'],
      to: 'the public internet',
    },
    {
      y: 285,
      n: 2,
      t: 'Tunnels',
      d: [
        'peer-to-peer QUIC connections (Iroh)',
        'land application traffic exactly where you want it',
      ],
      to: 'your apps and endpoints',
    },
    {
      y: 465,
      n: 3,
      t: 'Backbone',
      d: [
        'deterministic, auditable “fast lanes”',
        'SRv6 overlay with VPC-style control and observability',
      ],
      to: 'clouds, partners, providers',
    },
  ];
  rows.forEach((r) => {
    b +=
      tile(620, r.y, 470, 140) +
      badge(410, r.y + 36, r.n) +
      text(440, r.y + 42, r.t, { size: 20, weight: 500, anchor: 'start' }) +
      note(440, r.y + 80, r.d[0], { anchor: 'start' }) +
      note(440, r.y + 102, r.d[1], { anchor: 'start' });
    b += line(
      [
        [276, 360],
        [340, 360],
        [340, r.y + 70],
        [380, r.y + 70],
      ],
      'ok',
      { r: 14 }
    );
    b += line(
      [
        [860, r.y + 70],
        [940, r.y + 70],
      ],
      'neutral'
    );
    b += chip(948, r.y + 40, 220, 60, r.to);
  });
  return svg(W, H, b);
};

// 5 ─ chicken and egg
export const chickenAndEgg = () => {
  const W = 1140,
    H = 560;
  let b = deco(12, 1060, 40, 46);
  b += extFrame(30, 30, 1080, 500, 'Compute and Galactic VPC need each other');
  b +=
    tile(230, 140, 300, 190) +
    datum(230, 210, 'server', { r: 40 }) +
    text(230, 282, 'Datum Compute', { size: 19, weight: 500 }) +
    note(230, 304, 'microVMs that start in milliseconds');
  b +=
    tile(910, 140, 300, 190) +
    datum(910, 210, 'hub', { r: 40 }) +
    text(910, 282, 'Galactic VPC', { size: 19, weight: 500 }) +
    note(910, 304, 'private backbone built on SRv6');
  b +=
    line(
      [
        [392, 205],
        [748, 205],
      ],
      'ok'
    ) + tag(570, 205, 'every workload comes up attached', { fill: C.pine });
  b +=
    line(
      [
        [748, 268],
        [392, 268],
      ],
      'neutral'
    ) + tag(570, 268, 'real workloads show its value', { fill: C.ink });
  b += `<g><rect x="190" y="380" width="760" height="84" fill="${C.mossPale}" stroke="${C.pine}" stroke-width="${SW}"/>${text(570, 410, 'The payoff is the one the big clouds get', { size: 15, weight: 500 })}${text(570, 438, 'lower egress costs · reduced latency · a smaller security blast radius', { size: 15, fill: C.slate })}</g>`;
  return svg(W, H, b);
};
