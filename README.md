# TriggerMap

**TriggerMap** ist ein freier Editor zum Neu-Strukturieren der Kits & Sets des
**Roland HPD-20 "HandSonic"**. Das Gerät lässt sich nicht über MIDI editieren – Bearbeitung
erfolgt über die Backup-Datei (`BKUP-XXX.HS0`), die das HPD-20 selbst auf einen
USB-Stick schreibt. Dieser Editor liest, verändert und schreibt diese Datei
**komplett lokal** (nichts wird hochgeladen).

Verfügbar als Desktop-App (macOS/Windows, Tauri) und als lokale Web-App.

**[🌐 Webseite & Download](https://janralf-lgtm.github.io/hpd20-kit-editor/)** ·
**[⬇️ Releases](https://github.com/janralf-lgtm/hpd20-kit-editor/releases/latest)** ·
**[☕ Auf Ko-fi unterstützen](https://ko-fi.com/janstuerkat)**

> Kostenlos & quelloffen. Wenn dir TriggerMap hilft, freue ich mich über einen
> Kaffee auf Ko-fi — einmalig, Betrag frei wählbar. Unterstützer bekommen einen
> Code, der den Spenden-Hinweis in der App ausblendet (alle Funktionen sind ohnehin frei).

## Funktionen

- Kits umsortieren (Drag & Drop), kopieren, tauschen, umbenennen
- Gerätegetreue Pad-Fläche – Pad anklicken und Instrument, Volume, Pan, Pitch ändern
- Layer A/B pro Pad inkl. Layer-Modus (OFF / MIX / Layer / VELO MIX / VELO FADE / VELO SW) und Fade Point
- Tonleiter-Funktion für melodische Pads (Marimba, Vibraphone, Glockenspiel, …)
- Einzelne Kits als `.kit`-Datei exportieren/importieren
- Druckbare Gesamtübersicht aller Kits & Pad-Belegungen
- Byte-genauer Codec mit MD5-Neuberechnung, gegen echte Backups verifiziert

## Bauen & Starten

Siehe [`app/README.md`](app/README.md). Kurz:

```bash
cd app
npm install
npm run tauri dev     # Desktop-App (Entwicklung)
npm run tauri build   # .app/.dmg bzw. .exe/.msi
npm run dev           # alternativ als Web-App unter http://localhost:5173
```

## ⚠️ Wichtiger Hinweis

Arbeite immer mit einer **Kopie** deiner Backup-Datei und hebe das Original auf.
Die Nutzung erfolgt auf eigene Gefahr (siehe Gewährleistungsausschluss der GPL-3.0).

## Markenrechtlicher Hinweis

Dies ist ein **inoffizielles** Projekt und steht in **keiner Verbindung zu und
wird nicht unterstützt von der Roland Corporation**. „Roland", „HandSonic" und
„HPD-20" sind Marken ihrer jeweiligen Inhaber und werden hier ausschließlich zur
Beschreibung der Kompatibilität verwendet. Die enthaltene Geräte-Grafik ist eine
eigene, stilisierte Illustration.

## Lizenz

Lizenziert unter der **GNU General Public License v3.0** (siehe [`LICENSE`](LICENSE)).

Die Instrumentnamen stammen aus Rolands offizieller Sound List („Patch List",
`HPD-20_PA.pdf`, © Roland) als Sachdaten; die Tonhöhen sind aus den Notennamen
berechnet. Das Backup-Dateiformat wurde eigenständig an einer echten
Sicherungsdatei verifiziert. Als frühe Prior-Art sei
**[scjurgen/hpd-20](https://github.com/scjurgen/hpd-20)** (Jürgen Schwietering)
erwähnt, das das Format erstmals öffentlich dokumentiert hat.
