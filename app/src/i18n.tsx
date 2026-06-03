import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type Lang = "de" | "en" | "es" | "fr";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];

// Device/domain terms (pad names, layer modes, instrument names, scales, modes)
// are intentionally NOT translated — they match the hardware.
type Dict = Record<string, string>;

const de: Dict = {
  "dlg.openBackup": "HPD-20 Backup öffnen",
  "dlg.saveBackup": "Backup speichern",
  "dlg.exportKit": "Kit exportieren",
  "dlg.importKit": "Kit importieren",
  "err.load": "Konnte Datei nicht laden:\n{msg}",

  "landing.intro":
    "Lade eine Backup-Datei deines Roland HPD-20 (`Roland/HPD-20/Backup/BKUP-XXX.HS0` vom USB-Stick). Alles läuft lokal – nichts wird hochgeladen.",
  "landing.open": "Backup-Datei öffnen…",
  disclaimer:
    "Inoffizielles Projekt – keine Verbindung zu bzw. Unterstützung durch Roland. „Roland“, „HandSonic“ und „HPD-20“ sind Marken ihrer jeweiligen Inhaber.",

  "top.checksumOk": "Prüfsumme OK",
  "top.checksumBad": "Prüfsumme ungültig",
  "top.print": "Übersicht / Drucken",
  "top.editor": "Editor",
  "top.save": "Speichern",
  "top.otherFile": "Andere Datei…",

  safety:
    "⚠️ Originaldatei aufheben – als Kopie speichern (Vorschlag `BKUP-EDIT.HS0`). Zum Zurückspielen aufs Gerät in den Backup-Ordner des USB-Sticks legen und über `SYS → USB-Memory` laden.",

  "kits.heading": "Kits",
  "kits.filter": "Kits filtern…",
  "kits.empty": "(leer)",
  "kits.drag": "Ziehen zum Umsortieren",

  "kit.index": "Kit {n}",
  "kit.subtitle": "Untertitel",
  "kit.export": "Kit exportieren (.kit)",
  "kit.import": "Kit importieren…",
  "kit.scale": "🎵 Tonleiter…",

  "pad.surface": "HPD-20 Pad-Fläche",
  "pad.externals": "Externe Trigger / Sensor",
  "pad.empty": "(leer)",
  "pad.vol": "Vol {n}",

  "ed.pad": "Pad",
  "ed.layerMode": "Layer-Modus (Instrument B)",
  "ed.fadePoint": "Fade Point",
  "ed.instrumentA": "Instrument A",
  "ed.instrumentB": "Instrument B",
  "ed.bOff": " (aus)",
  "ed.bOffTitle": "Layer-Modus ist OFF – B wird nicht gespielt",
  "ed.instrument": "Instrument {layer}",
  "ed.volume": "Volume: {n}",
  "ed.pan": "Pan: {v}",
  "ed.panCenter": "Mitte",
  "ed.pitch": "Pitch (Cents): {n}",
  "ed.midiNote": "MIDI-Note",
  "ed.muffling": "Muffling",
  "ed.sweep": "Sweep",

  "pick.search": "Instrument suchen… (Name oder Nummer)",
  "pick.none": "Keine Treffer",

  "scale.title": "Tonleiter auf Kit {n} anwenden",
  "scale.instrument": "Instrument",
  "scale.scale": "Tonleiter",
  "scale.mode": "Modus",
  "scale.modeOnly7": "(nur 7-Ton)",
  "scale.root": "Grundton",
  "scale.padOrder": "Pad-Reihenfolge",
  "scale.preview": "Vorschau ({n} Pads)",
  "scale.cancel": "Abbrechen",
  "scale.apply": "Anwenden",

  "print.title": "TriggerMap – Kit-Übersicht",
  "print.pad": "Pad",
  "print.instA": "Instrument A",
  "print.vol": "Vol",
  "print.layer": "Layer",
  "print.instB": "Instrument B",
  "print.empty": "–",

  "lang.label": "Sprache",
  "view.to2d": "2D-Ansicht",
  "view.to3d": "3D-Ansicht",
  "view.loading3d": "3D wird geladen…",

  "support.hint": "TriggerMap ist gratis & quelloffen – unterstütze die Entwicklung.",
  "support.cta": "Unterstützen",
  "support.redeem": "Code einlösen",
  "support.enterCode": "Supporter-Code eingeben (nach der Spende per Ko-fi erhalten):",
  "support.invalid": "Code ungültig.",
  "support.thanks": "Danke für deine Unterstützung! ☕",
  "support.badge": "Supporter ☕",
};

const en: Dict = {
  "dlg.openBackup": "Open HPD-20 backup",
  "dlg.saveBackup": "Save backup",
  "dlg.exportKit": "Export kit",
  "dlg.importKit": "Import kit",
  "err.load": "Could not load the file:\n{msg}",

  "landing.intro":
    "Load a backup file from your Roland HPD-20 (`Roland/HPD-20/Backup/BKUP-XXX.HS0` from the USB stick). Everything runs locally — nothing is uploaded.",
  "landing.open": "Open backup file…",
  disclaimer:
    "Unofficial project — not affiliated with or endorsed by Roland. “Roland”, “HandSonic” and “HPD-20” are trademarks of their respective owners.",

  "top.checksumOk": "Checksum OK",
  "top.checksumBad": "Checksum invalid",
  "top.print": "Overview / Print",
  "top.editor": "Editor",
  "top.save": "Save",
  "top.otherFile": "Other file…",

  safety:
    "⚠️ Keep the original file — save as a copy (suggested `BKUP-EDIT.HS0`). To restore it to the device, place it in the backup folder of the USB stick and load it via `SYS → USB-Memory`.",

  "kits.heading": "Kits",
  "kits.filter": "Filter kits…",
  "kits.empty": "(empty)",
  "kits.drag": "Drag to reorder",

  "kit.index": "Kit {n}",
  "kit.subtitle": "Subtitle",
  "kit.export": "Export kit (.kit)",
  "kit.import": "Import kit…",
  "kit.scale": "🎵 Scale…",

  "pad.surface": "HPD-20 pad surface",
  "pad.externals": "External triggers / sensor",
  "pad.empty": "(empty)",
  "pad.vol": "Vol {n}",

  "ed.pad": "Pad",
  "ed.layerMode": "Layer mode (instrument B)",
  "ed.fadePoint": "Fade point",
  "ed.instrumentA": "Instrument A",
  "ed.instrumentB": "Instrument B",
  "ed.bOff": " (off)",
  "ed.bOffTitle": "Layer mode is OFF — B is not played",
  "ed.instrument": "Instrument {layer}",
  "ed.volume": "Volume: {n}",
  "ed.pan": "Pan: {v}",
  "ed.panCenter": "Center",
  "ed.pitch": "Pitch (cents): {n}",
  "ed.midiNote": "MIDI note",
  "ed.muffling": "Muffling",
  "ed.sweep": "Sweep",

  "pick.search": "Search instrument… (name or number)",
  "pick.none": "No matches",

  "scale.title": "Apply scale to kit {n}",
  "scale.instrument": "Instrument",
  "scale.scale": "Scale",
  "scale.mode": "Mode",
  "scale.modeOnly7": "(7-note only)",
  "scale.root": "Root note",
  "scale.padOrder": "Pad order",
  "scale.preview": "Preview ({n} pads)",
  "scale.cancel": "Cancel",
  "scale.apply": "Apply",

  "print.title": "TriggerMap – Kit overview",
  "print.pad": "Pad",
  "print.instA": "Instrument A",
  "print.vol": "Vol",
  "print.layer": "Layer",
  "print.instB": "Instrument B",
  "print.empty": "–",

  "lang.label": "Language",
  "view.to2d": "2D view",
  "view.to3d": "3D view",
  "view.loading3d": "Loading 3D…",

  "support.hint": "TriggerMap is free & open source — support its development.",
  "support.cta": "Support",
  "support.redeem": "Redeem code",
  "support.enterCode": "Enter your supporter code (sent via Ko-fi after donating):",
  "support.invalid": "Invalid code.",
  "support.thanks": "Thanks for your support! ☕",
  "support.badge": "Supporter ☕",
};

const es: Dict = {
  "dlg.openBackup": "Abrir copia de seguridad HPD-20",
  "dlg.saveBackup": "Guardar copia de seguridad",
  "dlg.exportKit": "Exportar kit",
  "dlg.importKit": "Importar kit",
  "err.load": "No se pudo cargar el archivo:\n{msg}",

  "landing.intro":
    "Carga un archivo de copia de seguridad de tu Roland HPD-20 (`Roland/HPD-20/Backup/BKUP-XXX.HS0` desde la memoria USB). Todo funciona localmente: no se sube nada.",
  "landing.open": "Abrir archivo de copia…",
  disclaimer:
    "Proyecto no oficial — sin afiliación ni respaldo de Roland. «Roland», «HandSonic» y «HPD-20» son marcas de sus respectivos propietarios.",

  "top.checksumOk": "Suma de comprobación OK",
  "top.checksumBad": "Suma de comprobación inválida",
  "top.print": "Resumen / Imprimir",
  "top.editor": "Editor",
  "top.save": "Guardar",
  "top.otherFile": "Otro archivo…",

  safety:
    "⚠️ Conserva el archivo original — guarda una copia (sugerido `BKUP-EDIT.HS0`). Para restaurarlo en el dispositivo, colócalo en la carpeta de copias de la memoria USB y cárgalo mediante `SYS → USB-Memory`.",

  "kits.heading": "Kits",
  "kits.filter": "Filtrar kits…",
  "kits.empty": "(vacío)",
  "kits.drag": "Arrastra para reordenar",

  "kit.index": "Kit {n}",
  "kit.subtitle": "Subtítulo",
  "kit.export": "Exportar kit (.kit)",
  "kit.import": "Importar kit…",
  "kit.scale": "🎵 Escala…",

  "pad.surface": "Superficie de pads HPD-20",
  "pad.externals": "Disparadores externos / sensor",
  "pad.empty": "(vacío)",
  "pad.vol": "Vol {n}",

  "ed.pad": "Pad",
  "ed.layerMode": "Modo de capa (instrumento B)",
  "ed.fadePoint": "Punto de fundido",
  "ed.instrumentA": "Instrumento A",
  "ed.instrumentB": "Instrumento B",
  "ed.bOff": " (apagado)",
  "ed.bOffTitle": "El modo de capa está en OFF — B no suena",
  "ed.instrument": "Instrumento {layer}",
  "ed.volume": "Volumen: {n}",
  "ed.pan": "Pan: {v}",
  "ed.panCenter": "Centro",
  "ed.pitch": "Tono (cents): {n}",
  "ed.midiNote": "Nota MIDI",
  "ed.muffling": "Muffling",
  "ed.sweep": "Sweep",

  "pick.search": "Buscar instrumento… (nombre o número)",
  "pick.none": "Sin resultados",

  "scale.title": "Aplicar escala al kit {n}",
  "scale.instrument": "Instrumento",
  "scale.scale": "Escala",
  "scale.mode": "Modo",
  "scale.modeOnly7": "(solo 7 notas)",
  "scale.root": "Nota fundamental",
  "scale.padOrder": "Orden de pads",
  "scale.preview": "Vista previa ({n} pads)",
  "scale.cancel": "Cancelar",
  "scale.apply": "Aplicar",

  "print.title": "TriggerMap – Resumen de kits",
  "print.pad": "Pad",
  "print.instA": "Instrumento A",
  "print.vol": "Vol",
  "print.layer": "Capa",
  "print.instB": "Instrumento B",
  "print.empty": "–",

  "lang.label": "Idioma",
  "view.to2d": "Vista 2D",
  "view.to3d": "Vista 3D",
  "view.loading3d": "Cargando 3D…",

  "support.hint": "TriggerMap es gratis y de código abierto — apoya su desarrollo.",
  "support.cta": "Apoyar",
  "support.redeem": "Canjear código",
  "support.enterCode": "Introduce tu código de apoyo (enviado por Ko-fi tras donar):",
  "support.invalid": "Código no válido.",
  "support.thanks": "¡Gracias por tu apoyo! ☕",
  "support.badge": "Supporter ☕",
};

const fr: Dict = {
  "dlg.openBackup": "Ouvrir la sauvegarde HPD-20",
  "dlg.saveBackup": "Enregistrer la sauvegarde",
  "dlg.exportKit": "Exporter le kit",
  "dlg.importKit": "Importer le kit",
  "err.load": "Impossible de charger le fichier :\n{msg}",

  "landing.intro":
    "Chargez un fichier de sauvegarde de votre Roland HPD-20 (`Roland/HPD-20/Backup/BKUP-XXX.HS0` depuis la clé USB). Tout fonctionne en local — rien n'est envoyé.",
  "landing.open": "Ouvrir un fichier de sauvegarde…",
  disclaimer:
    "Projet non officiel — sans affiliation ni approbation de Roland. « Roland », « HandSonic » et « HPD-20 » sont des marques de leurs propriétaires respectifs.",

  "top.checksumOk": "Somme de contrôle OK",
  "top.checksumBad": "Somme de contrôle invalide",
  "top.print": "Aperçu / Imprimer",
  "top.editor": "Éditeur",
  "top.save": "Enregistrer",
  "top.otherFile": "Autre fichier…",

  safety:
    "⚠️ Conservez le fichier original — enregistrez une copie (suggéré `BKUP-EDIT.HS0`). Pour le restaurer sur l'appareil, placez-le dans le dossier de sauvegarde de la clé USB et chargez-le via `SYS → USB-Memory`.",

  "kits.heading": "Kits",
  "kits.filter": "Filtrer les kits…",
  "kits.empty": "(vide)",
  "kits.drag": "Glisser pour réordonner",

  "kit.index": "Kit {n}",
  "kit.subtitle": "Sous-titre",
  "kit.export": "Exporter le kit (.kit)",
  "kit.import": "Importer un kit…",
  "kit.scale": "🎵 Gamme…",

  "pad.surface": "Surface de pads HPD-20",
  "pad.externals": "Déclencheurs externes / capteur",
  "pad.empty": "(vide)",
  "pad.vol": "Vol {n}",

  "ed.pad": "Pad",
  "ed.layerMode": "Mode de couche (instrument B)",
  "ed.fadePoint": "Point de fondu",
  "ed.instrumentA": "Instrument A",
  "ed.instrumentB": "Instrument B",
  "ed.bOff": " (désactivé)",
  "ed.bOffTitle": "Le mode de couche est sur OFF — B n'est pas joué",
  "ed.instrument": "Instrument {layer}",
  "ed.volume": "Volume : {n}",
  "ed.pan": "Pan : {v}",
  "ed.panCenter": "Centre",
  "ed.pitch": "Hauteur (cents) : {n}",
  "ed.midiNote": "Note MIDI",
  "ed.muffling": "Muffling",
  "ed.sweep": "Sweep",

  "pick.search": "Rechercher un instrument… (nom ou numéro)",
  "pick.none": "Aucun résultat",

  "scale.title": "Appliquer la gamme au kit {n}",
  "scale.instrument": "Instrument",
  "scale.scale": "Gamme",
  "scale.mode": "Mode",
  "scale.modeOnly7": "(7 notes uniquement)",
  "scale.root": "Note fondamentale",
  "scale.padOrder": "Ordre des pads",
  "scale.preview": "Aperçu ({n} pads)",
  "scale.cancel": "Annuler",
  "scale.apply": "Appliquer",

  "print.title": "TriggerMap – Aperçu des kits",
  "print.pad": "Pad",
  "print.instA": "Instrument A",
  "print.vol": "Vol",
  "print.layer": "Couche",
  "print.instB": "Instrument B",
  "print.empty": "–",

  "lang.label": "Langue",
  "view.to2d": "Vue 2D",
  "view.to3d": "Vue 3D",
  "view.loading3d": "Chargement 3D…",

  "support.hint": "TriggerMap est gratuit et open source — soutenez son développement.",
  "support.cta": "Soutenir",
  "support.redeem": "Saisir le code",
  "support.enterCode": "Saisissez votre code de soutien (reçu via Ko-fi après le don) :",
  "support.invalid": "Code invalide.",
  "support.thanks": "Merci pour votre soutien ! ☕",
  "support.badge": "Supporter ☕",
};

const DICTS: Record<Lang, Dict> = { de, en, es, fr };

const STORAGE_KEY = "triggermap-lang";

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && DICTS[saved]) return saved;
  } catch {
    /* ignore */
  }
  const nav = (navigator.language || "de").slice(0, 2) as Lang;
  return DICTS[nav] ? nav : "de";
}

function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`,
  );
}

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Like t() but renders `backtick` segments as <code> elements. */
  tc: (key: string, vars?: Record<string, string | number>) => ReactNode;
}

const Ctx = createContext<I18n | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      interpolate(DICTS[lang][key] ?? DICTS.de[key] ?? key, vars),
    [lang],
  );

  const tc = useCallback(
    (key: string, vars?: Record<string, string | number>): ReactNode => {
      const parts = t(key, vars).split("`");
      return parts.map((p, i) =>
        i % 2 === 1 ? <code key={i}>{p}</code> : p,
      );
    },
    [t],
  );

  return <Ctx.Provider value={{ lang, setLang, t, tc }}>{children}</Ctx.Provider>;
}

export function useT(): I18n {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useT must be used within LanguageProvider");
  return ctx;
}
