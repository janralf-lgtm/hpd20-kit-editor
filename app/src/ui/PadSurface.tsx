import type { Backup } from "../codec/backup";
import { PAD_NAMES } from "../codec/layout";
import {
  SURFACE_PADS,
  EXTERNAL_PADS,
  VIEW_W,
  VIEW_H,
  CENTER,
  R_OUTER,
  R_RIM,
  GROOVES,
  RIM_BOLTS,
  DBEAM_ZONE,
  innerArcPath,
  bodyPath,
} from "./padLayout";
import { useT } from "../i18n";

// Split a long instrument name across up to two <tspan> lines for readability.
function nameLines(name: string): string[] {
  if (name.length <= 12) return [name];
  const words = name.split(" ");
  if (words.length === 1) return [name];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

const line = (p: [number, number][]) => ({
  x1: p[0][0],
  y1: p[0][1],
  x2: p[1][0],
  y2: p[1][1],
});

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
    const a = empty ? PAD_NAMES[padIndex] : pad.getInstrumentName(0);
    const b =
      pad.getLayerMode() !== 0 && !pad.isEmpty(1) ? pad.getInstrumentName(1) : null;
    return { a, b, empty };
  };

  const trunc = (s: string, n = 16) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  const dbeam = labelFor(DBEAM_ZONE.index);

  return (
    <div className="surface-wrap">
      <svg
        className="device-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="group"
        aria-label={t("pad.surface")}
      >
        <defs>
          <radialGradient id="rimGrad" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#c4c8d0" />
            <stop offset="70%" stopColor="#9a9ea7" />
            <stop offset="100%" stopColor="#74777f" />
          </radialGradient>
          <radialGradient id="surfGrad" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#3c3f46" />
            <stop offset="100%" stopColor="#2c2e34" />
          </radialGradient>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2e35" />
            <stop offset="100%" stopColor="#202329" />
          </linearGradient>
        </defs>

        {/* Device body */}
        <path d={bodyPath()} fill="url(#bodyGrad)" stroke="#121419" strokeWidth={3} />

        {/* Control panel */}
        <g className="device-panel">
          <rect
            x={CENTER.x - 372}
            y={62}
            width={744}
            height={196}
            rx={26}
            fill="#30353e"
            stroke="#15171c"
            strokeWidth={2}
          />
          {/* branding */}
          <text x={CENTER.x - 348} y={150} className="panel-brand">
            HandSonic
          </text>
          <text x={CENTER.x - 348} y={176} className="panel-sub">
            HPD-20
          </text>
          {/* display */}
          <rect
            x={CENTER.x - 96}
            y={150}
            width={196}
            height={74}
            rx={8}
            fill="#16242f"
            stroke="#0c1218"
            strokeWidth={2}
          />
          <rect x={CENTER.x - 84} y={164} width={172} height={46} rx={4} fill="#22424f" />
          {/* knobs (left) */}
          {[0, 1].map((i) => (
            <circle
              key={i}
              cx={CENTER.x - 252 + i * 70}
              cy={210}
              r={20}
              fill="#1b1e23"
              stroke="#3d434c"
              strokeWidth={3}
            />
          ))}
          {/* button grid (right) */}
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={i}
              x={CENTER.x + 132 + (i % 4) * 52}
              y={150 + Math.floor(i / 4) * 36}
              width={38}
              height={24}
              rx={5}
              fill="#3a414b"
            />
          ))}
        </g>

        {/* D-Beam emitter (above the display) — clickable */}
        <g className="dbeam-zone" onClick={() => onSelect(DBEAM_ZONE.index)}>
          <rect
            x={DBEAM_ZONE.x}
            y={DBEAM_ZONE.y}
            width={DBEAM_ZONE.w}
            height={DBEAM_ZONE.h}
            rx={12}
            className={`dbeam-rect ${selectedPad === DBEAM_ZONE.index ? "sel" : ""}`}
          />
          <text
            x={DBEAM_ZONE.labelX}
            y={DBEAM_ZONE.labelY}
            textAnchor="middle"
            className="dbeam-label"
          >
            {`D-Beam · ${dbeam.empty ? t("pad.empty") : trunc(dbeam.a, 18)}`}
          </text>
        </g>

        {/* Drum: silver rim + playing surface */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={R_RIM}
          fill="url(#rimGrad)"
          stroke="#5e616a"
          strokeWidth={2}
        />
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={R_OUTER}
          fill="url(#surfGrad)"
          stroke="#202227"
          strokeWidth={2}
        />

        {/* rim bolts */}
        {RIM_BOLTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={7} fill="#0d0e11" stroke="#4a4d55" strokeWidth={1.5} />
        ))}

        {/* Moulded pad grooves (same geometry as the zones) */}
        <g className="grooves" stroke="#474a52" strokeWidth={4} fill="none" strokeLinecap="round">
          <line {...line(GROOVES.crossH)} />
          <line {...line(GROOVES.crossV)} />
          <path d={innerArcPath()} />
          {GROOVES.sDividers.map((d, i) => (
            <line key={i} {...line(d)} />
          ))}
          <circle cx={CENTER.x} cy={CENTER.y} r={SURFACE_PADS[4].r} />
        </g>

        {/* Interactive pad zones + labels */}
        {SURFACE_PADS.map((p) => {
          const sel = selectedPad === p.index;
          const cls = `zone ${sel ? "zone-sel" : ""}`;
          const { a, b, empty } = labelFor(p.index);
          const isS = p.index >= 5 && p.index <= 12;
          const lines: { text: string; b?: boolean }[] = isS
            ? [{ text: empty ? a : trunc(a, 11) }]
            : nameLines(a).map((tx) => ({ text: tx }));
          if (!isS && b) lines.push({ text: "＋ " + trunc(b), b: true });
          const dyStep = isS ? 16 : 24;
          const startDy = -((lines.length - 1) * (isS ? 8 : 12));
          return (
            <g key={p.index} className="pad-zone" onClick={() => onSelect(p.index)}>
              {p.shape === "polygon" ? (
                <polygon className={cls} points={p.points} />
              ) : (
                <circle className={cls} cx={p.cx} cy={p.cy} r={p.r} />
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
