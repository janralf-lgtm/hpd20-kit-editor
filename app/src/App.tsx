import { useState, useCallback } from "react";
import { Backup } from "./codec/backup";
import { KitList } from "./ui/KitList";
import { PadSurface } from "./ui/PadSurface";
import { PadEditor } from "./ui/PadEditor";
import { PrintView } from "./ui/PrintView";
import { ScaleDialog } from "./ui/ScaleDialog";
import { LanguageSwitcher } from "./ui/LanguageSwitcher";
import { applyScaleToKit } from "./codec/scaleApply";
import { openBinaryFile, saveBinaryFile } from "./platform/files";
import { useT } from "./i18n";
import "./App.css";

function sanitize(s: string) {
  return s.replace(/[^A-Za-z0-9 !&()_.{}-]/g, "_").trim() || "Kit";
}

export default function App() {
  const { t, tc } = useT();
  const [backup, setBackup] = useState<Backup | null>(null);
  const [fileName, setFileName] = useState("");
  const [selectedKit, setSelectedKit] = useState(0);
  const [selectedPad, setSelectedPad] = useState(0);
  const [rev, setRev] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [checksum, setChecksum] = useState<boolean | null>(null);
  const [scaleOpen, setScaleOpen] = useState(false);

  const bump = useCallback(() => {
    setRev((r) => r + 1);
    setDirty(true);
  }, []);

  const openFile = async () => {
    const f = await openBinaryFile(["HS0"], t("dlg.openBackup"));
    if (!f) return;
    try {
      const bk = Backup.parse(f.bytes);
      setBackup(bk);
      setFileName(f.name);
      setSelectedKit(0);
      setSelectedPad(0);
      setDirty(false);
      setChecksum(bk.verifyChecksum().valid);
      setRev((r) => r + 1);
    } catch (e) {
      alert(t("err.load", { msg: (e as Error).message }));
    }
  };

  const save = async () => {
    if (!backup) return;
    const ok = await saveBinaryFile(
      backup.toBytes(),
      "BKUP-EDIT.HS0",
      ["HS0"],
      t("dlg.saveBackup"),
    );
    if (ok) setDirty(false);
  };

  const exportKit = async () => {
    if (!backup) return;
    const kit = backup.getKit(selectedKit);
    const sub = kit.getSubName().trim();
    const fn = sanitize(kit.getName() + (sub ? ` (${sub})` : "")) + ".kit";
    await saveBinaryFile(backup.exportKit(selectedKit), fn, ["kit"], t("dlg.exportKit"));
  };

  const importKit = async () => {
    if (!backup) return;
    const f = await openBinaryFile(["kit"], t("dlg.importKit"));
    if (!f) return;
    try {
      backup.importKit(selectedKit, f.bytes);
      bump();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  if (!backup) {
    return (
      <div className="landing">
        <div className="landing-card">
          <div className="landing-lang">
            <LanguageSwitcher />
          </div>
          <h1>TriggerMap</h1>
          <p>{tc("landing.intro")}</p>
          <button className="primary" onClick={openFile}>
            {t("landing.open")}
          </button>
          <p className="disclaimer">{t("disclaimer")}</p>
        </div>
      </div>
    );
  }

  const kit = backup.getKit(selectedKit);

  return (
    <div className="app">
      <header className="topbar">
        <strong>TriggerMap</strong>
        <span className="file-name">{fileName}</span>
        {checksum !== null && (
          <span className={`chk ${checksum ? "ok" : "bad"}`}>
            {checksum ? t("top.checksumOk") : t("top.checksumBad")}
          </span>
        )}
        <span className="spacer" />
        <LanguageSwitcher />
        <button onClick={() => setPrinting((p) => !p)}>
          {printing ? t("top.editor") : t("top.print")}
        </button>
        <button className="primary" onClick={save}>
          {t("top.save")}
          {dirty ? " *" : ""}
        </button>
        <button onClick={openFile}>{t("top.otherFile")}</button>
      </header>

      <div className="safety">{tc("safety")}</div>

      {printing ? (
        <PrintView backup={backup} />
      ) : (
        <div className="main">
          <aside className="panel kit-panel">
            <h2>{t("kits.heading")}</h2>
            <KitList
              key={fileName}
              backup={backup}
              rev={rev}
              selectedKit={selectedKit}
              onSelectKit={(i) => {
                setSelectedKit(i);
                setSelectedPad(0);
              }}
              onEdit={bump}
            />
          </aside>

          <section className="panel center-panel">
            <div className="kit-head">
              <span className="kit-index">{t("kit.index", { n: selectedKit + 1 })}</span>
              <input
                className="kit-name-input"
                value={kit.getName()}
                maxLength={12}
                onChange={(e) => {
                  kit.setName(e.target.value);
                  bump();
                }}
              />
              <input
                className="kit-sub-input"
                value={kit.getSubName()}
                maxLength={16}
                placeholder={t("kit.subtitle")}
                onChange={(e) => {
                  kit.setSubName(e.target.value);
                  bump();
                }}
              />
            </div>
            <div className="kit-actions">
              <button onClick={exportKit}>{t("kit.export")}</button>
              <button onClick={importKit}>{t("kit.import")}</button>
              <button onClick={() => setScaleOpen(true)}>{t("kit.scale")}</button>
            </div>
            <PadSurface
              backup={backup}
              kit={selectedKit}
              selectedPad={selectedPad}
              onSelect={setSelectedPad}
            />
          </section>

          <aside className="panel edit-panel">
            <PadEditor
              backup={backup}
              kit={selectedKit}
              padIndex={selectedPad}
              onEdit={bump}
            />
          </aside>
        </div>
      )}

      {scaleOpen && (
        <ScaleDialog
          kitIndex={selectedKit}
          onApply={(opts) => {
            applyScaleToKit(backup, selectedKit, opts);
            bump();
          }}
          onClose={() => setScaleOpen(false)}
        />
      )}
    </div>
  );
}
