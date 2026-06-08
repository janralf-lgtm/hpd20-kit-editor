// Geometry of the HPD-20 playing surface, drawn as a clean parametric SVG.
// CRITICAL: the device GRAPHIC and the clickable pad ZONES are generated from
// the SAME constants below, so they are pixel-perfectly aligned by construction
// (no backdrop image, no calibration). Proportions are taken from a photo of the
// real device:
//   M1/M2 = large bottom quarters     M3/M4 = upper inner quarters
//   M5    = centre circle             S1-S8 = 8 equal outer-ring segments (top 180°)
// Angles use math convention (0deg = east, 90deg = north) in an y-down space.

export const VIEW_W = 1000;
export const VIEW_H = 1200;

export const CENTER = { x: 500, y: 720 };
const R_M5 = 70; // centre circle radius
const R_INNER = 265; // outer edge of the M1-M4 quarters / inner edge of the S ring
export const R_OUTER = 400; // outer edge of the S ring (= playing-surface edge)
export const R_RIM = 442; // outer edge of the silver rim around the surface

export function polar(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [CENTER.x + r * Math.cos(a), CENTER.y - r * Math.sin(a)];
}

// Annular sector (or solid sector when rIn=0) as a polygon point string.
function sector(rIn: number, rOut: number, d1: number, d2: number): string {
  const steps = 24;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) pts.push(polar(rOut, d1 + ((d2 - d1) * i) / steps));
  for (let i = steps; i >= 0; i--) pts.push(polar(rIn, d1 + ((d2 - d1) * i) / steps));
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

function centroid(rIn: number, rOut: number, d1: number, d2: number): [number, number] {
  return polar((rIn + rOut) / 2, (d1 + d2) / 2);
}

export interface SurfacePad {
  index: number;
  shape: "polygon" | "circle";
  points?: string; // for polygon
  cx?: number;
  cy?: number;
  r?: number; // for circle
  labelX: number;
  labelY: number;
}

// rOut defaults to R_INNER (upper M3/M4 quarters stop where the S ring begins);
// the lower M1/M2 quarters pass rOut=R_OUTER since there is no S ring below.
function quarter(index: number, d1: number, d2: number, rOut: number = R_INNER): SurfacePad {
  const [labelX, labelY] = centroid(R_M5, rOut, d1, d2);
  return { index, shape: "polygon", points: sector(R_M5, rOut, d1, d2), labelX, labelY };
}

function ringSeg(index: number, d1: number, d2: number): SurfacePad {
  const [labelX, labelY] = centroid(R_INNER, R_OUTER, d1, d2);
  return { index, shape: "polygon", points: sector(R_INNER, R_OUTER, d1, d2), labelX, labelY };
}

// S1..S8 each span 22.5deg across the top half (180deg left -> 0deg right).
const sPads: SurfacePad[] = Array.from({ length: 8 }, (_, i) => {
  const d2 = 180 - i * 22.5;
  const d1 = d2 - 22.5;
  return ringSeg(5 + i, d1, d2);
});

export const SURFACE_PADS: SurfacePad[] = [
  quarter(0, 180, 270, R_OUTER), // M1 bottom-left (full radius, no S ring below)
  quarter(1, 270, 360, R_OUTER), // M2 bottom-right (full radius)
  quarter(2, 90, 180), // M3 top-left (stops at S ring)
  quarter(3, 0, 90), // M4 top-right (stops at S ring)
  {
    index: 4,
    shape: "circle",
    cx: CENTER.x,
    cy: CENTER.y,
    r: R_M5,
    labelX: CENTER.x,
    labelY: CENTER.y,
  }, // M5 centre
  ...sPads,
];

// ---- Device-graphic geometry (panel + rim grooves), drawn behind the zones ----

// Groove paths used to "mould" the pad lines onto the drawn surface.
export const GROOVES = {
  // Cross: horizontal full chord + vertical full chord through the centre.
  crossH: [polar(R_OUTER, 180), polar(R_OUTER, 0)] as [number, number][],
  crossV: [polar(R_OUTER, 90), polar(R_OUTER, 270)] as [number, number][],
  // Radial dividers of the S ring (9 lines at 0,22.5,…180°), R_INNER→R_OUTER.
  sDividers: Array.from({ length: 9 }, (_, i) => {
    const d = i * 22.5;
    return [polar(R_INNER, d), polar(R_OUTER, d)] as [number, number][];
  }),
};

// Inner arc (S-ring inner boundary) as an SVG path across the top 180°.
export function innerArcPath(): string {
  const [x1, y1] = polar(R_INNER, 180);
  const [x2, y2] = polar(R_INNER, 0);
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R_INNER} ${R_INNER} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

// Outline of the device body: a circle hugging the drum at the bottom that rises
// into a rounded-rectangle panel at the top.
export function bodyPath(): string {
  const bodyR = R_RIM + 26; // body radius around the drum
  const sx = CENTER.x - bodyR; // left side x
  const ex = CENTER.x + bodyR; // right side x
  const topY = 44;
  const corner = 54;
  const [bx0, by0] = [sx, CENTER.y];
  const [bx1] = [ex, CENTER.y];
  return [
    `M ${bx0.toFixed(1)} ${by0.toFixed(1)}`,
    `L ${sx.toFixed(1)} ${(topY + corner).toFixed(1)}`,
    `Q ${sx.toFixed(1)} ${topY.toFixed(1)} ${(sx + corner).toFixed(1)} ${topY.toFixed(1)}`,
    `L ${(ex - corner).toFixed(1)} ${topY.toFixed(1)}`,
    `Q ${ex.toFixed(1)} ${topY.toFixed(1)} ${ex.toFixed(1)} ${(topY + corner).toFixed(1)}`,
    `L ${bx1.toFixed(1)} ${CENTER.y.toFixed(1)}`,
    `A ${bodyR} ${bodyR} 0 0 1 ${bx0.toFixed(1)} ${by0.toFixed(1)}`,
    "Z",
  ].join(" ");
}

// 12 rim bolts evenly spaced around the silver rim.
export const RIM_BOLTS = Array.from({ length: 12 }, (_, i) =>
  polar(R_RIM - 16, i * 30 + 15),
);

// D-Beam emitter sits above the display, near the top of the panel.
export const DBEAM_ZONE = {
  index: 13,
  x: CENTER.x - 120,
  y: 96,
  w: 240,
  h: 40,
  labelX: CENTER.x,
  labelY: 116,
};

// Trigger / sensor inputs edited via buttons below the surface.
// (D-Beam is drawn on the panel instead — see DBEAM_ZONE.)
export const EXTERNAL_PADS = [
  { index: 14, name: "Head" },
  { index: 15, name: "Rim" },
  { index: 16, name: "HH" },
];
