import { logo, deco, tile, C, SW, text, tag, label, badge, ext, datum, rack, icon, datumFrame, extFrame, line, hatch, swoosh, squares, svg } from '../kit.mjs';

const mono = (x, y, s, o = {}) => text(x, y, s, { mono: true, size: 12.5, fill: C.muted, ...o });
const outcome = (x, y, w, h, lines, o = {}) =>
  `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${o.fill ?? C.mossPale}" stroke="${o.stroke ?? C.pine}" stroke-width="${SW}"/>${text(x + w / 2, y + h / 2 - ((lines.length - 1) * 11) + 5, lines, { size: o.size ?? 16, lh: 22, fill: o.color ?? C.navy, weight: 500 })}</g>`;

// 1 ─ dual stack vs IPv6-native
export const image1 = () => {
  const W = 1240, H = 960;
  let b = '';
  b += deco(4, 1090, -70, 200) + deco(6, -50, 850, 140);
  // panel A (everywhere else = external, grayscale)
  b += extFrame(50, 40, 1140, 400, 'Everywhere else: dual stack');
  b += ext(170, 270, 'laptop') + text(170, 345, 'client', { size: 16 });
  b += logo(640, 270, 'nginx') + text(640, 345, 'nginx', { size: 16 }) + mono(640, 366, 'listen 8080;', { anchor: 'middle' });
  b += line([[236, 232], [574, 232]], 'neutral') + badge(262, 232, 1) + tag(405, 232, 'try IPv6');
  b += line([[574, 270], [236, 270]], 'bad') + tag(405, 270, 'refused', { fill: C.clay });
  b += line([[236, 308], [574, 308]], 'ok') + badge(262, 308, 2) + tag(405, 308, 'quietly retry IPv4', { fill: C.pine });
  b += line([[708, 270], [880, 270]], 'ok');
  b += outcome(890, 224, 250, 92, ['200 OK', 'nobody notices']);
  // panel B (Datum Compute)
  b += extFrame(50, 490, 1140, 420, 'Datum Compute: IPv6-native');
  b += tile(190, 665, 160, 185);
  b += datum(190, 735, 'hub') + text(190, 820, 'Datum ALB', { size: 16 });
  b += logo(640, 735, 'nginx') + text(640, 810, 'nginx', { size: 16 }) + mono(640, 831, 'listen 8080;');
  b += line([[280, 715], [574, 715]], 'neutral') + tag(415, 715, 'IPv6 only');
  b += line([[574, 758], [280, 758]], 'bad') + tag(415, 758, 'refused', { fill: C.clay });
  b += line([[190, 665], [190, 600], [880, 600]], 'bad', { r: 14 });
  b += outcome(890, 548, 250, 104, ['503', "the config's IPv4", 'assumption, surfaced'], { fill: C.clayPale, stroke: C.clay, color: C.clayDeep, size: 15 });
  b += deco(12, 1120, 836, 52);
  return svg(W, H, b);
};

// 2 ─ shared link vs one link per instance
export const image2 = () => {
  const W = 1300, H = 1000;
  let b = '';
  b += extFrame(40, 60, 600, 860, 'Home LAN or Podman: a shared link');
  b += ext(340, 230, 'hub') + text(340, 304, 'one shared link', { size: 16 });
  b += line([[340, 322], [340, 385]], 'link', { dot: true });
  b += line([[340, 385], [340, 410]], 'link', { solid: true, arrow: false });
  b += line([[140, 410], [540, 410]], 'link', { arrow: false });
  b += line([[140, 410], [140, 470]], 'link', { dotEnd: true });
  b += line([[340, 410], [340, 470]], 'link', { dotEnd: true });
  b += line([[540, 410], [540, 470]], 'link', { dotEnd: true });
  b += ext(140, 540, 'router') + text(140, 614, 'router', { size: 16 });
  b += ext(340, 540, 'laptop') + text(340, 614, 'a', { size: 16 });
  b += ext(540, 540, 'laptop') + text(540, 614, 'b', { size: 16 });
  b += line([[540, 640], [540, 710], [340, 710], [340, 640]], 'ok', { r: 14, both: true });
  b += tag(440, 710, 'direct', { fill: C.pine });
  b += text(440, 765, 'NDP finds b’s MAC', { size: 15, fill: C.slate });
  // right: Datum, one link per instance
  b += extFrame(700, 60, 560, 860, 'Datum: one link per instance');
  b += tile(835, 140, 176, 200) + tile(1125, 140, 176, 200) + tile(980, 650, 200, 200);
  b += rack(835, 215) + text(835, 292, 'instance', { size: 16 }) + mono(835, 313, 'fd20:0:53::1:0:0');
  b += rack(1125, 215) + text(1125, 292, 'instance', { size: 16 }) + mono(1125, 313, 'fd20:0:53::2:0:0');
  b += line([[835, 345], [835, 560], [980, 560], [980, 650]], 'link', { dot: true, r: 16 });
  b += line([[1125, 345], [1125, 560], [980, 560]], 'link', { dot: true, arrow: false, r: 16 });
  b += line([[945, 215], [1015, 215]], 'bad', { both: true });
  b += tag(980, 184, 'link-local ×', { fill: C.clay }) + tag(980, 246, 'ff02::1 ×', { fill: C.clay });
  b += label(980, 470, ['same /64, still', 'via the router'], { size: 15, fill: C.slate });
  b += datum(980, 720, 'router') + text(980, 800, 'router', { size: 16 }) + mono(980, 821, 'fd20:0:53::1');
  return svg(W, H, b);
};

// 3 ─ network → locations → instances
export const image3 = () => {
  const W = 1180, H = 1120;
  let b = '';
  b += deco(3, 0, 10, 120) + deco(6, 1040, 960, 130) + deco(12, 1090, 30, 56);
  b += tile(150, 480, 240, 220);
  b += datum(150, 560, 'hub', { r: 56 });
  b += text(150, 650, 'network blog-net', { size: 17, weight: 500 }) + mono(150, 672, 'fd20:0:53::/48', { size: 13.5 });
  const locs = [
    { y: 215, n: 'us-west-1', c: 'fd20:0:53:0::/64', kids: [[120, 'fd20:0:53::1:0:0/96'], [310, 'fd20:0:53::2:0:0/96']] },
    { y: 560, n: 'us-central-1', c: 'fd20:0:53:2::/64', kids: [[560, 'fd20:0:53:2:0:1::/96']] },
    { y: 905, n: 'us-east-1', c: 'fd20:0:53:1::/64', kids: [[905, 'fd20:0:53:1:0:1::/96']] },
  ];
  for (const L of locs) {
    b += line([[282, 560], [330, 560], [330, L.y], [420, L.y]], 'ok', { r: 18 });
    b += ext(480, L.y, 'pin') + text(480, L.y + 70, L.n, { size: 17, weight: 500 }) + mono(480, L.y + 92, L.c, { size: 13 });
  }
  const rows = [[130, 'fd20:0:53::1:0:0/96'], [300, 'fd20:0:53::2:0:0/96'], [560, 'fd20:0:53:2:0:1::/96'], [905, 'fd20:0:53:1:0:1::/96']];
  const src = [[215, 130], [215, 300], [560, 560], [905, 905]];
  src.forEach(([sy, ty], i) => {
    b += line([[545, sy], [680, sy], [680, ty], [746, ty]], 'ok', { r: 18 });
    b += tile(880, ty - 62, 250, 150) + rack(880, ty - 12) + mono(880, ty + 58, rows[i][1], { size: 12.5 });
  });
  return svg(W, H, b);
};

// 4 ─ IPv4-only client through the ALB to an IPv6-only app
export const image4 = () => {
  const W = 820, H = 1580;
  let b = '';
  b += deco(4, 600, 0, 170) + deco(6, 10, 1380, 120);
  b += ext(410, 80, 'laptop') + text(410, 154, 'IPv4-only client', { size: 17, weight: 500 });
  b += line([[410, 174], [410, 322]], 'neutral') + tag(410, 250, 'HTTPS · anycast · A + AAAA');
  b += tile(410, 330, 280, 215);
  b += datum(410, 400, 'hub', { r: 52 }) + text(410, 488, 'Datum ALB', { size: 17, weight: 500 }) + text(410, 510, 'Envoy at the nearest edge', { size: 14, fill: C.muted });
  b += line([[410, 553], [410, 740]], 'ok');
  b += label(410, 630, ['new connection from', 'fd42:…'], { size: 14 }) + tag(410, 690, 'X-Forwarded-For: client IPv4');
  b += datumFrame(190, 750, 440, 230, 'IPv6 inside');
  b += rack(410, 855) + text(410, 925, 'your app', { size: 16, weight: 500 }) + mono(410, 946, 'fd20:0:53::1:0:0 · IPv6 only', { size: 12.5 });
  // left: DNS64 + NAT64
  b += line([[300, 980], [300, 1010], [240, 1010], [240, 1132]], 'neutral', { r: 14 });
  b += label(240, 1075, ['IPv4-only name', '→ 64:ff9b::… address'], { size: 13.5 });
  b += tile(240, 1140, 280, 195);
  b += datum(240, 1210, 'swap', { r: 46 }) + text(240, 1290, 'DNS64 + NAT64', { size: 16, weight: 500 }) + text(240, 1312, 'per-location egress', { size: 14, fill: C.muted });
  b += line([[240, 1343], [240, 1400], [350, 1400], [350, 1440]], 'neutral', { r: 14 });
  b += label(300, 1368, ['leaves from a shared', 'IPv4 per location'], { size: 13.5 });
  // right: literal address fails
  b += line([[520, 980], [520, 1010], [610, 1010], [610, 1200]], 'bad', { r: 14 });
  b += line([[610, 1262], [610, 1400], [470, 1400], [470, 1440]], 'bad', { r: 14 });
  b += tag(610, 1235, 'a literal like 1.1.1.1 ×', { fill: C.clay });
  b += label(610, 1320, ['nothing to', 'translate'], { size: 13.5, fill: C.clayDeep });
  b += ext(410, 1500, 'globe', { r: 40 }) + text(410, 1556, 'IPv4-only internet', { size: 16, weight: 500 });
  return svg(W, H, b);
};

// 5 ─ configs from other platforms
export const image5 = () => {
  const W = 1560, H = 720;
  let b = '';
  b += ext(110, 360, 'case', { r: 54 }) + text(110, 442, 'configs from', { size: 16 }) + text(110, 464, 'other platforms', { size: 16 });
  const rows = [
    ['listen 8080; · 0.0.0.0', 'healthy-looking, 503'],
    ['8.8.8.8 · 1.1.1.1', 'no route to a literal'],
    ['preferIPv4Stack · tcp4', 'no IPv4 stack to use'],
    ['your own DNS resolver', 'loses DNS64'],
    ['169.254.169.254', 'no route to a literal'],
  ];
  const ys = [90, 225, 360, 495, 630];
  rows.forEach(([a, r], i) => {
    const y = ys[i];
    b += line([[170, 360], [210, 360], [210, y], [270, y]], 'neutral', { r: 16, dot: false });
    b += `<g><rect x="280" y="${y - 28}" width="330" height="56" fill="${C.panel}" stroke="${C.line}" stroke-width="${SW}"/>${text(445, y + 5.5, a, { size: 14, mono: true, fill: C.ink })}</g>`;
    b += line([[610, y], [706, y]], 'bad');
    b += `<g><rect x="716" y="${y - 28}" width="300" height="56" fill="${C.clayPale}" stroke="${C.clay}" stroke-width="${SW}"/>${text(866, y + 5.5, r, { size: 16, fill: C.clayDeep })}</g>`;
    b += line([[1016, y], [1096, y]], 'ok');
  });
  b += datumFrame(1106, 40, 420, 640, '');
  b += text(1316, 330, ['grep · ss -tln', 'dig AAAA ipv4only.arpa'], { size: 17, mono: true, lh: 26, weight: 500 });
  b += text(1316, 410, 'before you move', { size: 17, weight: 500, fill: C.pine });
  return svg(W, H, b);
};

// 7 ─ four ways to connect regions
export const image7 = () => {
  const W = 1500, H = 1700;
  let b = '';
  // Datum
  b += extFrame(220, 30, 1060, 420, 'Datum: one network, every metro, no setup');
  b += tile(750, 108, 190, 178) + tile(430, 224, 190, 178) + tile(1070, 224, 190, 178);
  b += rack(750, 190) + text(750, 262, 'us-central-1', { size: 16, weight: 500 });
  b += rack(430, 305) + text(430, 380, 'us-west-1', { size: 16, weight: 500 });
  b += rack(1070, 305) + text(1070, 380, 'us-east-1', { size: 16, weight: 500 });
  b += line([[648, 190], [570, 190], [570, 300], [533, 300]], 'ok', { both: true, r: 14 });
  b += line([[852, 190], [930, 190], [930, 300], [967, 300]], 'ok', { both: true, r: 14 });
  b += line([[533, 372], [570, 372], [570, 424], [930, 424], [930, 372], [967, 372]], 'ok', { both: true, r: 14 });
  b += tag(750, 424, '1 hop · MTU 1440', { fill: C.pine });
  // Fly + Railway
  b += extFrame(30, 500, 1440, 300, 'Fly.io and Railway: WireGuard mesh');
  b += logo(150, 665, 'fly') + text(150, 740, 'Fly.io', { size: 16 });
  b += logo(1350, 665, 'railway') + text(1350, 740, 'Railway', { size: 16 });
  b += `<g><rect x="300" y="635" width="240" height="64" fill="${C.clayPale}" stroke="${C.clay}" stroke-width="${SW}"/>${text(420, 674, 'lax', { size: 17, fill: C.clayDeep, weight: 500 })}</g>`;
  b += `<g><rect x="960" y="635" width="240" height="64" fill="${C.clayPale}" stroke="${C.clay}" stroke-width="${SW}"/>${text(1080, 674, 'iad', { size: 17, fill: C.clayDeep, weight: 500 })}</g>`;
  b += line([[540, 667], [960, 667]], 'bad', { both: true });
  b += tag(750, 667, '3 hops · MTU 1370 / 1316', { fill: C.clay });
  // Google
  b += extFrame(30, 850, 1440, 300, 'Google Cloud: global VPC, you plan it');
  b += logo(150, 1015, 'google') + text(150, 1090, 'Google Cloud', { size: 16 });
  b += `<g><rect x="300" y="975" width="280" height="80" fill="${C.panel}" stroke="${C.line}" stroke-width="${SW}"/>${text(440, 1008, 'us-west1', { size: 16, weight: 500 })}${mono(440, 1034, '10.10.1.0/24 ✍', { anchor: 'middle' })}</g>`;
  b += `<g><rect x="920" y="975" width="280" height="80" fill="${C.panel}" stroke="${C.line}" stroke-width="${SW}"/>${text(1060, 1008, 'us-east4', { size: 16, weight: 500 })}${mono(1060, 1034, '10.10.2.0/24 ✍', { anchor: 'middle' })}</g>`;
  b += line([[580, 1015], [920, 1015]], 'neutral', { both: true });
  b += tag(750, 1015, 'firewall rules first');
  // Vultr
  b += extFrame(30, 1200, 1440, 300, 'Vultr: a VPC per region, IPv4-only');
  b += logo(150, 1365, 'vultr') + text(150, 1440, 'Vultr', { size: 16 });
  b += `<g><rect x="300" y="1335" width="240" height="64" fill="${C.slate}"/>${text(420, 1374, 'ewr VPC', { size: 16, fill: '#fff', weight: 500 })}</g>`;
  b += `<g><rect x="960" y="1335" width="240" height="64" fill="${C.slate}"/>${text(1080, 1374, 'lax VPC', { size: 16, fill: '#fff', weight: 500 })}</g>`;
  b += line([[540, 1367], [960, 1367]], 'bad', { both: true });
  b += tag(750, 1367, 'public internet · 14 hops', { fill: C.clay });
  return svg(W, H - 140, b);
};

// 11 ─ SRv6 sequence
export const image11 = () => {
  const W = 1620, H = 1180;
  let b = '';
  const cols = [
    ['west', 'instance', 150, 'dc'], ['west node', '(kernel + eBPF)', 440, 'dc'], ['next-door', 'instance', 730, 'dc'],
    ['backbone', '', 1020, 'ext'], ['east', 'node', 1240, 'dc'], ['east', 'instance', 1450, 'dc'],
  ];
  // bands
  b += `<rect x="60" y="150" width="760" height="300" fill="${C.clayPale}"/>`;
  b += `<rect x="60" y="500" width="1500" height="600" fill="${C.mossPale}"/>`;
  for (const [, , x] of cols) b += `<line x1="${x}" y1="100" x2="${x}" y2="1130" stroke="${C.line}" stroke-width="${SW}" stroke-dasharray="3 5"/>`;
  for (const [t1, t2, x, k] of cols) {
    const dc = k === 'dc';
    b += `<g><rect x="${x - 90}" y="20" width="180" height="76" fill="#fff" stroke="${dc ? C.moss : C.line}" stroke-width="${dc ? 8 : SW}"/><rect x="${x - 86}" y="24" width="172" height="68" fill="${C.panel}" stroke="${C.line}" stroke-width="${SW}"/>${text(x, t2 ? 55 : 63, t1, { size: 15, weight: 500 })}${t2 ? text(x, 77, t2, { size: 14, fill: C.muted }) : ''}</g>`;
  }
  const note = (x, y, w, lines) => `<g><rect x="${x - w / 2}" y="${y}" width="${w}" height="${lines.length * 22 + 22}" fill="#fff" stroke="${C.line}" stroke-width="${SW}"/>${text(x, y + 28, lines, { size: 14.5, lh: 22, fill: C.ink })}</g>`;
  const msg = (x1, x2, y, s, kind = 'neutral', t) => line([[x1, y], [x2, y]], kind) + tag((x1 + x2) / 2, y - 22, s, { fill: t ?? C.ink });
  b += label(190, 178, 'next door: same node', { size: 16, bg: C.clayPale, fill: C.clayDeep, weight: 500 });
  b += msg(150, 440, 230, 'packet · hop limit 64');
  b += note(440, 262, 230, ['kernel routes it', 'inside the VRF']);
  b += msg(440, 730, 390, 'packet · hop limit 63');
  b += label(250, 528, 'across the country: wrapped in SRv6', { size: 16, bg: C.mossPale, fill: C.pine, weight: 500 });
  b += msg(150, 440, 590, 'packet · hop limit 64');
  b += note(440, 622, 300, ['eBPF wraps it:', 'outer IPv6 header to', '“east node, blog-net”']);
  b += msg(440, 1020, 780, 'outer | packet', 'ok', C.pine);
  b += note(1020, 812, 260, ['routers read only', 'the outer header']);
  b += msg(1020, 1240, 920, 'outer | packet', 'ok', C.pine);
  b += note(1240, 952, 250, ['unwrap, redirect', 'into the instance']);
  b += msg(1240, 1450, 1070, 'packet · hop limit 64');
  return svg(W, H, b);
};
