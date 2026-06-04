import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Backup } from "../codec/backup";
import { PAD_NAMES } from "../codec/layout";
import { EXTERNAL_PADS } from "./padLayout";
import { buildPad3DShapes, fitModel, SURFACE_CALIB } from "./pad3d";
import { useT } from "../i18n";
import modelUrl from "../assets/hpd20.glb?url";

const trunc = (s: string, n = 14) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

function Pads({
  backup,
  kit,
  selectedPad,
  onSelect,
}: {
  backup: Backup;
  kit: number;
  selectedPad: number;
  onSelect: (i: number) => void;
}) {
  const { scene } = useGLTF(modelUrl);
  const fit = useMemo(() => fitModel(scene), [scene]);
  const shapes = useMemo(() => buildPad3DShapes(fit.radius), [fit.radius]);
  const [hover, setHover] = useState<number | null>(null);

  const label = (idx: number) => {
    const pad = backup.getPad(kit, idx);
    return pad.isEmpty(0) ? PAD_NAMES[idx] : trunc(pad.getInstrumentName(0));
  };

  return (
    <group>
      <group scale={fit.scale} position={fit.centerOffset}>
        <primitive object={scene} />
      </group>
      <group
        position={[SURFACE_CALIB.offsetX, fit.surfaceY, SURFACE_CALIB.offsetZ]}
        rotation={[-Math.PI / 2, 0, SURFACE_CALIB.rotationY]}
      >
        {shapes.map((p) => {
          const sel = p.index === selectedPad;
          const hov = p.index === hover;
          return (
            <group key={p.index}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(p.index);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHover(p.index);
                }}
                onPointerOut={() => setHover((h) => (h === p.index ? null : h))}
              >
                <shapeGeometry args={[p.shape]} />
                <meshBasicMaterial
                  color="#ff7a1a"
                  transparent
                  opacity={sel ? 0.42 : hov ? 0.18 : 0}
                  side={THREE.DoubleSide}
                  depthTest={false}
                  toneMapped={false}
                />
              </mesh>
              <Html
                position={[p.centroid[0], p.centroid[1], 0]}
                center
                pointerEvents="none"
                wrapperClass="pad3d-html"
              >
                <span className={`pad3d-label ${sel ? "sel" : ""}`}>
                  {label(p.index)}
                </span>
              </Html>
            </group>
          );
        })}
      </group>
    </group>
  );
}

useGLTF.preload(modelUrl);

export function Pad3DSurface({
  backup,
  kit,
  selectedPad,
  onSelect,
}: {
  backup: Backup;
  kit: number;
  selectedPad: number;
  onSelect: (i: number) => void;
}) {
  const { t } = useT();
  return (
    <div className="surface-wrap">
      <div className="surface3d">
        <Canvas camera={{ position: [0, 5.4, 1.85], fov: 30 }} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <Environment preset="city" />
            <ambientLight intensity={0.55} />
            <directionalLight position={[3, 6, 4]} intensity={1.1} />
            <Pads
              backup={backup}
              kit={kit}
              selectedPad={selectedPad}
              onSelect={onSelect}
            />
          </Suspense>
          {/* Fixed bird's-eye view — interaction disabled (no rotate/zoom/pan)
              so the device just looks 3D/plastic without being movable. */}
          <OrbitControls
            makeDefault
            enableRotate={false}
            enablePan={false}
            enableZoom={false}
            target={[0, 0, 0.4]}
          />
        </Canvas>
      </div>

      <div className="externals">
        <div className="externals-title">{t("pad.externals")}</div>
        <div className="externals-row">
          {EXTERNAL_PADS.map((e) => {
            const pad = backup.getPad(kit, e.index);
            return (
              <button
                key={e.index}
                className={`ext-pad ${selectedPad === e.index ? "pad-sel" : ""}`}
                onClick={() => onSelect(e.index)}
              >
                <span className="pad-id">{e.name}</span>
                <span className="pad-inst">
                  {pad.isEmpty(0) ? t("pad.empty") : pad.getInstrumentName(0)}
                </span>
                <span className="pad-vol">{t("pad.vol", { n: pad.getVolume(0) })}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
