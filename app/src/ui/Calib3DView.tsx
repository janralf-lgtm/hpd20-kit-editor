import { Suspense, useMemo } from "react";
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

function Scene() {
  const { scene } = useGLTF(modelUrl);
  const fit = useMemo(() => fitModel(scene), [scene]);
  const shapes = useMemo(() => buildPad3DShapes(fit.radius), [fit.radius]);
  return (
    <group>
      <group scale={fit.scale} position={fit.centerOffset}>
        <primitive object={scene} />
      </group>
      <group
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
      </group>
    </group>
  );
}

useGLTF.preload(modelUrl);

export default function Calib3DView() {
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
