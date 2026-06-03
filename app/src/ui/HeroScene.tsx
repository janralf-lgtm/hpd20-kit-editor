import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stage, OrbitControls, useGLTF } from "@react-three/drei";
import type { Group } from "three";
import modelUrl from "../assets/hpd20.glb?url";

const reducedMotion =
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

function Model() {
  const ref = useRef<Group>(null);
  const { scene } = useGLTF(modelUrl);
  useFrame((_, dt) => {
    if (!reducedMotion && ref.current) ref.current.rotation.y += dt * 0.25;
  });
  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(modelUrl);

export default function HeroScene() {
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 2]}
      camera={{ position: [0, 2.2, 4.5], fov: 42 }}
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        {/* Stage frames + lights the model; environment feeds the glossy/
            transmission materials so they look right. */}
        <Stage environment="city" intensity={0.5} adjustCamera={1.1} shadows={false}>
          <Model />
        </Stage>
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
