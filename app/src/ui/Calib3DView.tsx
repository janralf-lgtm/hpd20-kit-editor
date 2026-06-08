import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import modelUrl from "../assets/hpd20.glb?url";
import { buildPad3DShapes, fitModel, SURFACE_CALIB } from "./pad3d";

// Dev-only calibration view (?calib=1): top-down model + VISIBLE coloured pad
// hotspots, to tune SURFACE_CALIB (offsetX/Z, radiusFactor, rotationY) via
// headless screenshots until the zones sit exactly on the pads.

const COLORS = [
  "#ff7a1a", "#ffd23a", "#36c275", "#3a7afe", "#b06bff",
  "#ff5d8f", "#22c1c3", "#ff8a3a", "#7bdc4f", "#5a9bff",
  "#d36bff", "#ff6f91", "#3ad1c3",
];

const BARE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("bare") === "1";

// ?shot=1 renders ONLY the bare model, true top-down (orthographic), on a
// transparent background — used to bake a clean 2D device backdrop PNG.
const SHOT =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("shot") === "1";

function ShotScene() {
  const { scene } = useGLTF(modelUrl);
  const fit = useMemo(() => fitModel(scene), [scene]);
  return (
    <group scale={fit.scale} position={fit.centerOffset}>
      <primitive object={scene} />
    </group>
  );
}

function ShotView() {
  // Make the whole document transparent so the screenshot keeps an alpha channel.
  useEffect(() => {
    const prev = {
      html: document.documentElement.style.background,
      body: document.body.style.background,
    };
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    const root = document.getElementById("root");
    if (root) root.style.background = "transparent";
    return () => {
      document.documentElement.style.background = prev.html;
      document.body.style.background = prev.body;
    };
  }, []);

  // Proven near-top-down perspective camera; OrbitControls aims it at the origin.
  return (
    <div style={{ position: "fixed", inset: 0, background: "transparent" }}>
      <Canvas
        camera={{ position: [0, 8.5, 0.0001], fov: 33 }}
        gl={{ antialias: true, alpha: true }}
        dpr={2}
      >
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <ambientLight intensity={0.7} />
          <hemisphereLight intensity={0.5} />
          <directionalLight position={[2, 10, 3]} intensity={0.9} />
          <directionalLight position={[-3, 8, -2]} intensity={0.4} />
          <ShotScene />
        </Suspense>
        <OrbitControls makeDefault enableRotate={false} target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}

function Scene() {
  const { scene } = useGLTF(modelUrl);
  const fit = useMemo(() => fitModel(scene), [scene]);
  const shapes = useMemo(() => buildPad3DShapes(fit.radius), [fit.radius]);
  return (
    <group>
      <group scale={fit.scale} position={fit.centerOffset}>
        <primitive object={scene} />
      </group>
      {!BARE && <group
        position={[SURFACE_CALIB.offsetX, fit.surfaceY, SURFACE_CALIB.offsetZ]}
        rotation={[-Math.PI / 2, 0, SURFACE_CALIB.rotationY]}
      >
        {shapes.map((p, i) => (
          <mesh key={p.index}>
            <shapeGeometry args={[p.shape]} />
            <meshBasicMaterial
              color={COLORS[i % COLORS.length]}
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
              depthTest={false}
            />
          </mesh>
        ))}
      </group>}
    </group>
  );
}

useGLTF.preload(modelUrl);

export default function Calib3DView() {
  if (SHOT) return <ShotView />;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#16181d" }}>
      <Canvas camera={{ position: [0, 7, 0.0001], fov: 32 }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 6, 4]} intensity={1} />
          <Scene />
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
