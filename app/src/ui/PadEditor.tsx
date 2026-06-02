import { useState } from "react";
import type { Backup } from "../codec/backup";
import { PAD_NAMES, LAYER_MODES, fadePointActive } from "../codec/layout";
import { InstrumentPicker } from "./InstrumentPicker";
import { useT } from "../i18n";

export function PadEditor({
  backup,
  kit,
  padIndex,
  onEdit,
}: {
  backup: Backup;
  kit: number;
  padIndex: number;
  onEdit: () => void;
}) {
  const { t } = useT();
  const [picking, setPicking] = useState(false);
  const [layer, setLayer] = useState<0 | 1>(0);
  const pad = backup.getPad(kit, padIndex);

  const mode = pad.getLayerMode();
  const bActive = mode !== 0; // OFF => B unused
  const panLabel = (v: number) =>
    v === 0 ? t("ed.panCenter") : v < 0 ? `L${-v}` : `R${v}`;

  return (
    <div className="pad-editor">
      <h3>
        {t("ed.pad")} <span className="badge">{PAD_NAMES[padIndex]}</span>
      </h3>

      {/* Layer mode for the whole pad */}
      <label className="field">
        <span>{t("ed.layerMode")}</span>
        <select
          value={mode}
          onChange={(e) => {
            pad.setLayerMode(Number(e.target.value));
            onEdit();
          }}
        >
          {LAYER_MODES.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>
      </label>

      {fadePointActive(mode) && (
        <label className="field">
          <span>{t("ed.fadePoint")}: {pad.getFadePoint()}</span>
          <input
            type="range"
            min={0}
            max={127}
            value={pad.getFadePoint()}
            onChange={(e) => {
              pad.setFadePoint(Number(e.target.value));
              onEdit();
            }}
          />
        </label>
      )}

      {/* A / B layer selector */}
      <div className="layer-tabs">
        <button
          className={layer === 0 ? "tab-on" : ""}
          onClick={() => setLayer(0)}
        >
          {t("ed.instrumentA")}
        </button>
        <button
          className={`${layer === 1 ? "tab-on" : ""} ${!bActive ? "tab-dim" : ""}`}
          onClick={() => setLayer(1)}
          title={bActive ? "" : t("ed.bOffTitle")}
        >
          {t("ed.instrumentB")}{!bActive ? t("ed.bOff") : ""}
        </button>
      </div>

      <label className="field">
        <span>{t("ed.instrument", { layer: layer === 0 ? "A" : "B" })}</span>
        <button className="inst-btn" onClick={() => setPicking(true)}>
          <b>{pad.getPatch(layer) + 1}</b> {pad.getInstrumentName(layer)}
        </button>
      </label>

      <label className="field">
        <span>{t("ed.volume", { n: pad.getVolume(layer) })}</span>
        <input
          type="range"
          min={0}
          max={127}
          value={pad.getVolume(layer)}
          onChange={(e) => {
            pad.setVolume(Number(e.target.value), layer);
            onEdit();
          }}
        />
      </label>

      <label className="field">
        <span>{t("ed.pan", { v: panLabel(pad.getPan(layer)) })}</span>
        <input
          type="range"
          min={-64}
          max={63}
          value={pad.getPan(layer)}
          onChange={(e) => {
            pad.setPan(Number(e.target.value), layer);
            onEdit();
          }}
        />
      </label>

      <label className="field">
        <span>{t("ed.pitch", { n: pad.getPitch(layer) })}</span>
        <input
          type="range"
          min={-2400}
          max={2400}
          step={10}
          value={pad.getPitch(layer)}
          onChange={(e) => {
            pad.setPitch(Number(e.target.value), layer);
            onEdit();
          }}
        />
      </label>

      <div className="readouts">
        <div>
          {t("ed.midiNote")} <b>{pad.getMidiNote()}</b>
        </div>
        <div>
          {t("ed.muffling")} <b>{pad.getMuffling(layer)}</b>
        </div>
        <div>
          {t("ed.sweep")} <b>{pad.getSweep(layer)}</b>
        </div>
      </div>

      {picking && (
        <InstrumentPicker
          value={pad.getPatch(layer)}
          onChange={(num) => {
            pad.setPatch(num, layer);
            onEdit();
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </div>
  );
}
