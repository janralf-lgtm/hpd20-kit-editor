import { useState } from "react";
import { Backup } from "../codec/backup";
import { Pad3DSurface } from "./Pad3DSurface";

// Dev-only preview (mounted via ?calib=1): renders the real Pad3DSurface with a
// synthetic (zero-filled) backup so the 3D editor surface — tilt, hotspots,
// selection highlight, labels — can be checked via headless screenshots without
// loading a real device file.
const synthetic = new Backup(new Uint8Array(300000));

export default function Calib3DView() {
  const [sel, setSel] = useState(0);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#16181d", padding: 16 }}>
      <Pad3DSurface backup={synthetic} kit={0} selectedPad={sel} onSelect={setSel} />
    </div>
  );
}
