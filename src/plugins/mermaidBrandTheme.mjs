// src/plugins/mermaidBrandTheme.mjs
// Mermaid config for the "text diagram" version of a blog diagram: the plain, copyable,
// monospace take that engineers like. It is deliberately simpler than the designed images
// (see .claude/skills/datum-diagram), but it follows the same colour rule: grey outer panels,
// bright moss only on Datum content, grayscale for outside systems, clay for failures.
// Colors come from src/static/styles/variables.css.
//
// Authors tag nodes:
//   node:::datum  a Datum component (moss fill)
//   node:::ext    an outside system (white, grey line)
//   node:::ok     a good outcome (pale moss, pine line)
//   node:::bad    an error or failure (pale clay)
// Dashed links (`-.->`) are the default arrow; use `linkStyle` for clay (errors) or navy (neutral).

const MIDNIGHT_FJORD = '#0c1d31';
const UTILITY_SLATE = '#384555';
const AURORA_MOSS = '#e6f59f';
const AURORA_MOSS_PALE = '#f3f8dd';
const PINE_FORGE = '#4d6356';
const SILVER_KEYLINE = '#c4c6c9';
const SHARK_GRAY = '#6a7282';
const BLUSH = '#bf9595';
const BLUSH_PALE = '#f5e8e8';
const CLAY_DEEP = '#815e5e';

const MONO = "'DejaVu Sans Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SHAPES = 'rect, polygon, circle, ellipse, path';

const themeCSS = `
  .node :is(${SHAPES}) { fill: #ffffff; stroke: ${SHARK_GRAY}; stroke-width: 1px; }
  .node.datum :is(${SHAPES}) { fill: ${AURORA_MOSS}; stroke: ${PINE_FORGE}; }
  .node.ok :is(${SHAPES}) { fill: ${AURORA_MOSS_PALE}; stroke: ${PINE_FORGE}; }
  .node.bad :is(${SHAPES}) { fill: ${BLUSH_PALE}; stroke: ${BLUSH}; }
  .node.ext .nodeLabel, .node.ext .label, .node.ext span { color: ${UTILITY_SLATE}; fill: ${UTILITY_SLATE}; }
  .node.bad .nodeLabel, .node.bad .label, .node.bad span { color: ${CLAY_DEEP}; fill: ${CLAY_DEEP}; }
  .nodeLabel, .edgeLabel, .edgeLabel p, .edgeLabel span, .cluster-label span { font-family: ${MONO}; font-size: 13px; }
  .edgeLabel p, .edgeLabel span { margin: 0; color: ${UTILITY_SLATE}; background-color: #ffffff; }
  .edgeLabel .labelBkg { background-color: #ffffff; }
  .edgeLabel .labelBkg:has(> span:empty), .edgeLabel .labelBkg:has(p:empty) { display: none !important; }
  .cluster rect { fill: none; stroke: ${SILVER_KEYLINE}; stroke-width: 1px; stroke-dasharray: 4 3; }
  .cluster-label span { color: ${SHARK_GRAY}; font-size: 12px; letter-spacing: 0.02em; }
  .flowchart-link { stroke-width: 1px; }
  .edge-pattern-dotted, .edge-pattern-dashed { stroke: ${PINE_FORGE}; stroke-width: 1px; stroke-dasharray: 4 3; }
  .arrowMarkerPath { stroke-dasharray: none !important; }
  /* Sequence diagrams: thin grey lifelines, mono labels, no repeated actors at the bottom. */
  .actor { fill: #ffffff; stroke: ${SHARK_GRAY}; stroke-width: 1px; }
  .actor-line { stroke: ${SILVER_KEYLINE}; stroke-width: 1px; stroke-dasharray: 3 4; }
  .messageLine0, .messageLine1 { stroke-width: 1px; }
  .messageText { font-family: ${MONO}; font-size: 12.5px; fill: ${UTILITY_SLATE}; stroke: none; }
  .actor, text.actor > tspan { font-family: ${MONO}; font-size: 13px; }
`;

export const mermaidBrandConfig = {
  flowchart: {
    curve: 'linear',
    padding: 14,
    wrappingWidth: 360,
    subGraphTitleMargin: { top: 4, bottom: 12 },
  },
  sequence: {
    mirrorActors: false,
    actorMargin: 90,
    width: 150,
    messageMargin: 44,
    wrap: true,
    useMaxWidth: true,
  },
  themeCSS,
  themeVariables: {
    fontFamily: MONO,
    fontSize: '13px',
    background: '#ffffff',
    primaryColor: '#ffffff',
    primaryTextColor: MIDNIGHT_FJORD,
    primaryBorderColor: SHARK_GRAY,
    lineColor: MIDNIGHT_FJORD,
    textColor: MIDNIGHT_FJORD,
    edgeLabelBackground: '#ffffff',
    clusterBkg: 'transparent',
    clusterBorder: SILVER_KEYLINE,
  },
};
