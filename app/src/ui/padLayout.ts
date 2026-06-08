// Geometry of the HPD-20 playing surface, expressed in the coordinate system of
// the device artwork (src/assets/hpd20-device.png, 1300 x 1160). Each surface pad
// is rendered as its real shape so the clickable zones line up with the graphic:
//   M1/M2  = large bottom quarters      M3/M4 = upper inner quarters
//   M5     = centre circle              S1-S4 = outer ring arc on the LEFT
//   S5-S8  = outer ring arc on the RIGHT (S4/S5 meet at the top)
// Angles use math convention (0deg = east, 90deg = north), converted to the
// image's y-down coordinates. Tune CENTER / radii here to match the artwork.

// Backdrop = top-down render of the 3D model (src/assets/hpd20-device.png),
// cropped to the device. Coordinate space matches that PNG 1:1.
export const VIEW_W = 1016;
export const VIEW_H = 1329;

// Measured from the rendered model's playing surface (cross + M5 ring + molded
// pad edge), tuned via the ?dev=1 overlay until the zones sit on the pads.
export const CENTER = { x: 508, y: 836 };
const R_M5 = 65; // centre circle radius
const R_INNER = 274; // outer edge of the M1-M4 quarter discs / inner edge of S ring
export const R_OUTER = 392; // outer edge of the S ring (= playing-surface edge)

function polar(r: number, deg: number): [number, number] {
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

// Trigger / sensor inputs edited via buttons (D-Beam sits on the device top edge).
export const EXTERNAL_PADS = [
  { index: 13, name: "D-Beam" },
  { index: 14, name: "Head" },
  { index: 15, name: "Rim" },
  { index: 16, name: "HH" },
];
