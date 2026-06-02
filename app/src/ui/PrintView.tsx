import type { Backup } from "../codec/backup";
import { PAD_NAMES, LAYER_MODES } from "../codec/layout";
import { useT } from "../i18n";

export function PrintView({ backup }: { backup: Backup }) {
  const { t } = useT();
  const kits = Array.from({ length: backup.kitCount() }, (_, i) => i);
  return (
    <div className="print-view">
      <h1>{t("print.title")}</h1>
      {kits.map((k) => {
        const kit = backup.getKit(k);
        return (
          <div className="print-kit" key={k}>
            <h2>
              {k + 1}. {kit.getName()}{" "}
              {kit.getSubName() && <small>({kit.getSubName()})</small>}
            </h2>
            <table>
              <thead>
                <tr>
                  <th>{t("print.pad")}</th>
                  <th>{t("print.instA")}</th>
                  <th>{t("print.vol")}</th>
                  <th>{t("print.layer")}</th>
                  <th>{t("print.instB")}</th>
                </tr>
              </thead>
              <tbody>
                {PAD_NAMES.map((name, p) => {
                  const pad = backup.getPad(k, p);
                  const mode = pad.getLayerMode();
                  return (
                    <tr key={p}>
                      <td>{name}</td>
                      <td>{pad.isEmpty(0) ? t("print.empty") : pad.getInstrumentName(0)}</td>
                      <td>{pad.getVolume(0)}</td>
                      <td>{LAYER_MODES[mode] ?? mode}</td>
                      <td>{mode !== 0 ? pad.getInstrumentName(1) : t("print.empty")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
