import * as THREE from "three";
import { SURFACE_PADS, CENTER, R_OUTER } from "./padLayout";

// Maps the 2D pad layout (1300x1160 artwork space) onto the 3D model's playing
// surface (XZ plane). The 2D surface radius R_OUTER maps to `radius` world units;
// 2D (px,py) -> plane (u,v) centred on the pad centre. Shapes are built in the XY
// plane and the consuming mesh is rotated rotation.x = -PI/2 to lie flat on XZ.
//
// Sign convention chosen so that, after that rotation, 2D "down" (M1/M2, larger py)
// maps to +Z (front / toward viewer) and the S-pad arc (smaller py) to -Z (back,
// near the device panel). Calibration offset/rotation is applied by the component.

export interface Pad3DShape {
  index: number;
  shape: THREE.Shape;
  centroid: [number, number]; // plane coords (u, v) for label placement
}

// Calibration of the pad-hotspot plane relative to the (normalized) model.
// Tuned via the ?calib=1 view + headless renders. The model is normalized so its
// footprint max-dimension = `target`; values are in that normalized space.
export const SURFACE_CALIB = {
  target: 4, // normalized footprint size (max of X/Z) in world units
  radiusFactor: 0.85, // playing-surface radius as fraction of footprint half-width
  offsetX: 0, // shift surface centre (right) in world units
  offsetZ: 0.4, // shift surface centre (front/back) in world units
  yLift: -0.16, // offset from the model's top down onto the playing membrane (world units)
  rotationY: 0, // rotate pad ring so the S-arc sits at the panel (-Z)
  flipV: true, // map 2D "front" (large py, M1/M2) to +Z
};

export interface ModelFit {
  scale: number;
  centerOffset: [number, number, number];
  surfaceY: number;
  radius: number;
}

/** Normalize a loaded model: scale footprint to SURFACE_CALIB.target, centre at
 *  origin, and derive the playing-surface plane (Y) + radius. Recomputed from the
 *  bounding box at runtime, so swapping the model (same dimensions) keeps working. */
export function fitModel(scene: THREE.Object3D): ModelFit {
  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const maxXZ = Math.max(size.x, size.z) || 1;
  const scale = SURFACE_CALIB.target / maxXZ;
  return {
    scale,
    centerOffset: [-center.x * scale, -center.y * scale, -center.z * scale],
    surfaceY: (box.max.y - center.y) * scale + SURFACE_CALIB.yLift,
    radius: (size.x * scale) / 2 * SURFACE_CALIB.radiusFactor,
  };
}

function to2DPoints(points: string): [number, number][] {
  return points
    .trim()
    .split(/\s+/)
    .map((p) => {
      const [x, y] = p.split(",").map(Number);
      return [x, y] as [number, number];
    });
}

/** Build flat pad shapes scaled to a world `radius`. Plane coords: x=u (right), y=v. */
export function buildPad3DShapes(radius: number, flipV = SURFACE_CALIB.flipV): Pad3DShape[] {
  const s = radius / R_OUTER; // 2D px -> world units
  const fv = flipV ? -1 : 1;
  const map = (px: number, py: number): [number, number] => [
    (px - CENTER.x) * s, // u (right)
    (py - CENTER.y) * s * fv, // v (toward front before rotation)
  ];

  return SURFACE_PADS.map((p) => {
    const shape = new THREE.Shape();
    if (p.shape === "polygon" && p.points) {
      const pts = to2DPoints(p.points).map(([x, y]) => map(x, y));
      shape.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
      shape.closePath();
    } else {
      // M5 centre circle
      const [cu, cv] = map(p.cx ?? CENTER.x, p.cy ?? CENTER.y);
      const r = (p.r ?? 78) * s;
      shape.absarc(cu, cv, r, 0, Math.PI * 2, false);
    }
    const [lu, lv] = map(p.labelX, p.labelY);
    return { index: p.index, shape, centroid: [lu, lv] };
  });
}
