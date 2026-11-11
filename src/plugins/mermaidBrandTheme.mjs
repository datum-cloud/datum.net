// src/plugins/mermaidBrandTheme.mjs
// Mermaid config that follows the Datum diagram guidelines: a geometric, step-routed
// look, thin consistent lines, bright brand colors for Datum components and grayscale
// for everything outside Datum. Colors come from src/static/styles/variables.css.
//
// Authors opt in per node: `node:::datum` (Datum component) or `node:::ext` (outside
// system). Dashed links (`-.->`) take the brand green; override one with `linkStyle`.

const MIDNIGHT_FJORD = '#0c1d31';
const UTILITY_SLATE = '#384555';
const AURORA_MOSS = '#e6f59f';
const PINE_FORGE = '#4d6356';
const SILVER_MIST = '#c3c6c9';
const SILVER_KEYLINE = '#c4c6c9';
const SHARK_GRAY = '#6a7282';
const GLACIER_MIST = '#f6f6f5';

const SHAPES = 'rect, polygon, circle, ellipse, path';

const themeCSS = `
  /* 12px stroke clipped to the shape's own box leaves a 6px border drawn inside it,
     so the border never covers the arrowheads that end on the node's edge. */
  .node.datum :is(${SHAPES}) { fill: #ffffff; stroke: ${AURORA_MOSS}; stroke-width: 12px; clip-path: inset(0); }
  .node.ext :is(${SHAPES}) { fill: #ffffff; stroke: ${SILVER_MIST}; stroke-width: 1px; }
  .node.ext .nodeLabel, .node.ext .label, .node.ext span { color: ${SHARK_GRAY}; fill: ${SHARK_GRAY}; }
  /* Datum frame: the moss border above plus a hairline just inside it. */
  .node.datum :is(rect, polygon) { outline: 1px solid ${SILVER_KEYLINE}; outline-offset: -7px; }
  /* In the structured style (nodes tagged :::datum / :::ext), connector labels become small
     dark mono tags, like the guide's "Cloud CNI" / "IPsec Tunnel". Other diagrams keep plain labels. */
  .root:has(.node.datum, .node.ext) .edgeLabel .labelBkg { background-color: ${MIDNIGHT_FJORD}; padding: 2px 6px; }
  .root:has(.node.datum, .node.ext) .edgeLabel p, .root:has(.node.datum, .node.ext) .edgeLabel span { margin: 0; color: #ffffff; font-family: 'DejaVu Sans Mono', ui-monospace, Menlo, monospace; font-size: 11px; }
  .edgeLabel .labelBkg:has(> span:empty), .edgeLabel .labelBkg:has(p:empty) { display: none !important; }
  .cluster rect { fill: #ffffff; stroke: ${SILVER_KEYLINE}; stroke-width: 1px; }
  .flowchart-link { stroke-width: 1px; }
  /* Mermaid's arrow markers put the tip a few px past the edge's end, i.e. inside the
     node, where the thick border would cover it. Slide the head back so it lands on the edge. */
  marker { overflow: visible; }
  .arrowMarkerPath { stroke-dasharray: none !important; }
  marker[id$='-pointEnd'] path { transform: translateX(-5px); }
  marker[id$='-pointStart'] path { transform: translateX(4.5px); }
  .edge-pattern-dashed { stroke: ${PINE_FORGE}; stroke-width: 1px; stroke-dasharray: 4 3; }
`;

export const mermaidBrandConfig = {
  flowchart: { curve: 'step' },
  themeCSS,
  themeVariables: {
    fontFamily: "'Alliance No.1', ui-sans-serif, system-ui, sans-serif",
    background: GLACIER_MIST,
    primaryColor: '#ffffff',
    primaryTextColor: MIDNIGHT_FJORD,
    primaryBorderColor: UTILITY_SLATE,
    secondaryColor: AURORA_MOSS,
    tertiaryColor: GLACIER_MIST,
    lineColor: UTILITY_SLATE,
    textColor: MIDNIGHT_FJORD,
    edgeLabelBackground: GLACIER_MIST,
    clusterBkg: '#ffffff',
    clusterBorder: SILVER_KEYLINE,
    noteBkgColor: AURORA_MOSS,
    noteTextColor: MIDNIGHT_FJORD,
    noteBorderColor: '#adbab0',
    actorBkg: MIDNIGHT_FJORD,
    actorTextColor: '#ffffff',
    actorBorder: MIDNIGHT_FJORD,
    actorLineColor: MIDNIGHT_FJORD,
    signalColor: UTILITY_SLATE,
    signalTextColor: MIDNIGHT_FJORD,
  },
};
