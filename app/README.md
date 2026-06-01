# HPD-20 Kit-Editor

Lokale Web-App zum Neu-Strukturieren der Sets eines **Roland HPD-20 "HandSonic"**.
Das HPD-20 lässt sich nicht über MIDI editieren – der einzige Weg führt über die
Backup-Datei, die das Gerät selbst auf einen USB-Stick schreibt
(`Roland/HPD-20/Backup/BKUP-XXX.HS0`). Diese App bearbeitet diese Datei lokal im
Browser (nichts wird hochgeladen) und speichert sie wieder.

## Bedienung

Als Web-App (Entwicklung):

```bash
cd app
npm install      # einmalig
npm run dev      # Editor unter http://localhost:5173
```

Als Desktop-App (macOS/Windows, Tauri):

```bash
cd app
npm install
npm run tauri dev     # App-Fenster im Entwicklungsmodus
npm run tauri build   # erzeugt .app + .dmg (macOS) bzw. .exe/.msi (Windows)
```

Build-Artefakte liegen unter
`src-tauri/target/release/bundle/` (`macos/…​.app`, `dmg/…​.dmg`).
In der Desktop-App gibt es **native Öffnen-/Speichern-Dialoge** (Lesen/Schreiben
über Rust, daher auch USB-Sticks unter `/Volumes/…` ohne Scope-Konfiguration).
Im Browser dienen Datei-Auswahl bzw. Download als Fallback.

> Hinweis: Das `.dmg` ist nicht signiert/notarisiert. Beim Weitergeben an andere
> Macs muss die App per Rechtsklick → „Öffnen" freigegeben werden. Für eine
> reibungslose Verteilung wäre Apple-Signing/Notarisierung nötig.

1. „Backup-Datei öffnen…" → deine `BKUP-XXX.HS0` wählen.
2. Links Kits per Drag-&-Drop umsortieren / auswählen, Namen oben bearbeiten.
3. Mitte: gerätegetreue Pad-Fläche – Pad anklicken, rechts Instrument/Volume/Pan/Pitch ändern.
4. „Kit exportieren/importieren" für `.kit`-Dateien (Tausch mit anderen).
5. „Übersicht / Drucken" für eine druckbare Gesamtliste.
6. „Speichern" schreibt `BKUP-EDIT.HS0` mit neu berechneter Prüfsumme.

## Zurück aufs Gerät

`BKUP-EDIT.HS0` in `BKUP-XXX.HS0` umbenennen, in den Backup-Ordner des USB-Sticks
legen und am Gerät über `SYS → USB-Memory → Load Backup` laden.
**Immer das Original aufheben!**

## Tests

```bash
npm test   # bzw. npx vitest run
```

Der wichtigste Test ist der Byte-für-Byte-Round-Trip gegen eine echte
`BKUP-001.HS0`: Parsen → Serialisieren ergibt eine identische Datei inkl. MD5.

## Dateiformat (verifiziert)

Siehe `src/codec/layout.ts`. Kurz: flacher Binär-Dump, letzte 16 Bytes = MD5 über
den Rest; Kits ab Offset 6922 (200 × 224 B), Pads ab 51596 (17/Kit × 200 × 68 B).
Reverse-Engineering-Basis: github.com/scjurgen/hpd-20 (Python, verwaist) – hier
nach TypeScript portiert und an einer echten Datei verifiziert.
