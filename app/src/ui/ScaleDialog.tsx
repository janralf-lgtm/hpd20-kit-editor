import { useMemo, useState } from "react";
import {
  MELODIC_SETS,
  SCALE_PATTERNS,
  MELODY_PAD_PATTERNS,
  MODES,
  PITCH_CLASSES,
  noteNumber,
} from "../data/scales";
import { computeScale, type ScaleOptions } from "../codec/scaleApply";
import { useT } from "../i18n";

const MODE_NAMES = Object.keys(MODES); // IONIAN..LOCRIAN
const SEVEN_NOTE = new Set(["major", "minor", "harmonic minor"]);

export function ScaleDialog({
  kitIndex,
  onApply,
  onClose,
}: {
  kitIndex: number;
  onApply: (opts: ScaleOptions) => void;
  onClose: () => void;
}) {
  const { t } = useT();
  const [instrumentName, setInstrument] = useState(Object.keys(MELODIC_SETS)[0]);
  const [scaleName, setScale] = useState("major");
  const [mode, setMode] = useState(0);
  const [pitchClass, setPitchClass] = useState(0); // 0=C
  const [octave, setOctave] = useState(4);
  const [patternName, setPattern] = useState(Object.keys(MELODY_PAD_PATTERNS)[0]);

  const opts: ScaleOptions = {
    instrumentName,
    scaleName,
    mode,
    firstNote: noteNumber(pitchClass, octave),
    patternName,
  };

  const preview = useMemo(() => computeScale(opts), [
    instrumentName,
    scaleName,
    mode,
    pitchClass,
    octave,
    patternName,
  ]);

  const modeUsable = SEVEN_NOTE.has(scaleName);

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="scale-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="picker-head">
          <strong>{t("scale.title", { n: kitIndex + 1 })}</strong>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="scale-grid">
          <label>
            <span>{t("scale.instrument")}</span>
            <select
              value={instrumentName}
              onChange={(e) => setInstrument(e.target.value)}
            >
              {Object.keys(MELODIC_SETS).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>

          <label>
            <span>{t("scale.scale")}</span>
            <select value={scaleName} onChange={(e) => setScale(e.target.value)}>
              {Object.keys(SCALE_PATTERNS).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>

          <label>
            <span>{t("scale.mode")} {modeUsable ? "" : t("scale.modeOnly7")}</span>
            <select
              value={mode}
              disabled={!modeUsable}
              onChange={(e) => setMode(Number(e.target.value))}
            >
              {MODE_NAMES.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>{t("scale.root")}</span>
            <div className="root-row">
              <select
                value={pitchClass}
                onChange={(e) => setPitchClass(Number(e.target.value))}
              >
                {PITCH_CLASSES.map((n, i) => (
                  <option key={n} value={i}>
                    {n}
                  </option>
                ))}
              </select>
              <select
                value={octave}
                onChange={(e) => setOctave(Number(e.target.value))}
              >
                {[2, 3, 4, 5, 6, 7].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="span2">
            <span>{t("scale.padOrder")}</span>
            <select
              value={patternName}
              onChange={(e) => setPattern(e.target.value)}
            >
              {Object.keys(MELODY_PAD_PATTERNS).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="scale-preview">
          <div className="scale-preview-head">
            {t("scale.preview", { n: preview.length })}
          </div>
          <ul>
            {preview.map((s, i) => (
              <li key={i}>
                <span className="sp-pad">{s.padName}</span>
                <span className="sp-note">{s.targetNote}</span>
                <span className="sp-inst">{s.instrumentName}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="scale-actions">
          <button onClick={onClose}>{t("scale.cancel")}</button>
          <button
            className="primary"
            onClick={() => {
              onApply(opts);
              onClose();
            }}
          >
            {t("scale.apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
