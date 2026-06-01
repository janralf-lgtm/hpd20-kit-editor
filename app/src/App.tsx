import { useState, useCallback } from "react";
import { Backup } from "./codec/backup";
import { KitList } from "./ui/KitList";
import { PadSurface } from "./ui/PadSurface";
import { PadEditor } from "./ui/PadEditor";
import { PrintView } from "./ui/PrintView";
import { ScaleDialog } from "./ui/ScaleDialog";
import { applyScaleToKit } from "./codec/scaleApply";
import { openBinaryFile, saveBinaryFile } from "./platform/files";
import "./App.css";

function sanitize(s: string) {
  return s.replace(/[^A-Za-z0-9 !&()_.{}-]/g, "_").trim() || "Kit";
}

export default function App() {
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
    const f = await openBinaryFile(["HS0"], "HPD-20 Backup öffnen");
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
      alert(`Konnte Datei nicht laden:\n${(e as Error).message}`);
    }
  };

  const save = async () => {
    if (!backup) return;
    const ok = await saveBinaryFile(
      backup.toBytes(),
      "BKUP-EDIT.HS0",
      ["HS0"],
      "Backup speichern",
    );
    if (ok) setDirty(false);
  };

  const exportKit = async () => {
    if (!backup) return;
    const kit = backup.getKit(selectedKit);
    const sub = kit.getSubName().trim();
    const fn = sanitize(kit.getName() + (sub ? ` (${sub})` : "")) + ".kit";
    await saveBinaryFile(backup.exportKit(selectedKit), fn, ["kit"], "Kit exportieren");
  };

  const importKit = async () => {
    if (!backup) return;
    const f = await openBinaryFile(["kit"], "Kit importieren");
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
          <h1>HPD-20 Kit-Editor</h1>
          <p>
            Lade eine Backup-Datei deines Roland HPD-20 (
            <code>Roland/HPD-20/Backup/BKUP-XXX.HS0</code> vom USB-Stick).
            Alles läuft lokal – nichts wird hochgeladen.
          </p>
          <button className="primary" onClick={openFile}>
            Backup-Datei öffnen…
          </button>
          <p className="disclaimer">
            Inoffizielles Projekt – keine Verbindung zu bzw. Unterstützung durch
            Roland. „Roland", „HandSonic" und „HPD-20" sind Marken ihrer
            jeweiligen Inhaber.
          </p>
        </div>
      </div>
    );
  }

  const kit = backup.getKit(selectedKit);

  return (
    <div className="app">
      <header className="topbar">
        <strong>HPD-20 Kit-Editor</strong>
        <span className="file-name">{fileName}</span>
        {checksum !== null && (
          <span className={`chk ${checksum ? "ok" : "bad"}`}>
            {checksum ? "Prüfsumme OK" : "Prüfsumme ungültig"}
          </span>
        )}
        <span className="spacer" />
        <button onClick={() => setPrinting((p) => !p)}>
          {printing ? "Editor" : "Übersicht / Drucken"}
        </button>
        <button className="primary" onClick={save}>
          Speichern{dirty ? " *" : ""}
        </button>
        <button onClick={openFile}>Andere Datei…</button>
      </header>

      <div className="safety">
        ⚠️ Originaldatei aufheben – als Kopie speichern (Vorschlag{" "}
        <code>BKUP-EDIT.HS0</code>). Zum Zurückspielen aufs Gerät in den
        Backup-Ordner des USB-Sticks legen und über{" "}
        <code>SYS → USB-Memory</code> laden.
      </div>

      {printing ? (
        <PrintView backup={backup} />
      ) : (
        <div className="main">
          <aside className="panel kit-panel">
            <h2>Kits</h2>
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
              <span className="kit-index">Kit {selectedKit + 1}</span>
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
                placeholder="Untertitel"
                onChange={(e) => {
                  kit.setSubName(e.target.value);
                  bump();
                }}
              />
            </div>
            <div className="kit-actions">
              <button onClick={exportKit}>Kit exportieren (.kit)</button>
              <button onClick={importKit}>Kit importieren…</button>
              <button onClick={() => setScaleOpen(true)}>🎵 Tonleiter…</button>
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
