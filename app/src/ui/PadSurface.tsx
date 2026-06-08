import type { Backup } from "../codec/backup";
import { PAD_NAMES } from "../codec/layout";
import { SURFACE_PADS, EXTERNAL_PADS, VIEW_W, VIEW_H } from "./padLayout";
import deviceImg from "../assets/hpd20-device.png";
import { useT } from "../i18n";

// Split a long instrument name across up to two <tspan> lines for readability.
function nameLines(name: string): string[] {
  if (name.length <= 12) return [name];
  const words = name.split(" ");
  if (words.length === 1) return [name];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export function PadSurface({
  backup,
  kit,
  selectedPad,
  onSelect,
}: {
  backup: Backup;
  kit: number;
  selectedPad: number;
  onSelect: (padIndex: number) => void;
}) {
  const { t } = useT();
  const labelFor = (padIndex: number) => {
    const pad = backup.getPad(kit, padIndex);
    const empty = pad.isEmpty(0);
    // Empty pad: show its designation (M1, S1, …) instead of an instrument name.
    const a = empty ? PAD_NAMES[padIndex] : pad.getInstrumentName(0);
    const b =
      pad.getLayerMode() !== 0 && !pad.isEmpty(1) ? pad.getInstrumentName(1) : null;
    return { a, b, empty };
  };

  const trunc = (s: string, n = 16) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const grid =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("grid") === "1";

  return (
    <div className="surface-wrap">
      <svg
        className="device-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="group"
        aria-label={t("pad.surface")}
      >
        <image href={deviceImg} x={0} y={0} width={VIEW_W} height={VIEW_H} />

        {SURFACE_PADS.map((p) => {
          const sel = selectedPad === p.index;
          const cls = `zone ${sel ? "zone-sel" : ""}`;
          const { a, b, empty } = labelFor(p.index);
          const isS = p.index >= 5 && p.index <= 12; // small sub-pads => thin ring

          // Small S-pads: one short, single-line label (band is narrow).
          // Large M-pads: A name (wrapped) plus the B layer line.
          const lines: { text: string; b?: boolean }[] = isS
            ? [{ text: empty ? a : trunc(a, 11) }]
            : nameLines(a).map((t) => ({ text: t }));
          if (!isS && b) lines.push({ text: "＋ " + trunc(b), b: true });
          const dyStep = isS ? 16 : 24;
          const startDy = -((lines.length - 1) * (isS ? 8 : 12));
          return (
            <g
              key={p.index}
              className="pad-zone"
              onClick={() => onSelect(p.index)}
            >
              {p.shape === "polygon" ? (
                <polygon
                  className={cls}
                  points={p.points}
                  style={grid ? { stroke: "#ff2d2d", strokeWidth: 3, fill: "none" } : undefined}
                />
              ) : (
                <circle
                  className={cls}
                  cx={p.cx}
                  cy={p.cy}
                  r={p.r}
                  style={grid ? { stroke: "#ff2d2d", strokeWidth: 3, fill: "none" } : undefined}
                />
              )}
              <text
                className={`zone-label ${isS ? "zone-label-s" : ""} ${empty ? "zone-empty" : ""}`}
                x={p.labelX}
                y={p.labelY}
                textAnchor="middle"
              >
                {lines.map((ln, i) => (
                  <tspan
                    key={i}
                    x={p.labelX}
                    dy={i === 0 ? startDy : dyStep}
                    className={ln.b ? "layer-b" : ""}
                  >
                    {ln.text}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>

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
