import type { Backup } from "./backup";
import { PAD_NAMES } from "./layout";
import { getInstrumentName } from "../data/instruments";
import {
  getScale,
  noteName,
  SCALE_PATTERNS,
  MELODY_PAD_PATTERNS,
} from "../data/scales";

export interface ScaleOptions {
  instrumentName: string; // key in MELODIC_SETS
  scaleName: string; // key in SCALE_PATTERNS
  mode: number; // MODES.*
  firstNote: number; // semitone number (C4 = 72)
  patternName: string; // key in MELODY_PAD_PATTERNS
}

export interface ScaleStep {
  padIndex: number;
  padName: string;
  instrumentIndex: number;
  instrumentName: string;
  pitchOffset: number; // cents written to the pad
  targetNote: string; // intended note name
}

/** Compute, without modifying anything, what a scale would assign to each pad. */
export function computeScale(opts: ScaleOptions): ScaleStep[] {
  const pattern = MELODY_PAD_PATTERNS[opts.patternName];
  const pat = SCALE_PATTERNS[opts.scaleName];
  const notes = getScale(
    opts.instrumentName,
    opts.firstNote,
    pattern.length,
    opts.scaleName,
    opts.mode,
  );
  return pattern.map((padIndex, i) => {
    const nh = i + opts.mode;
    const h =
      pat[((nh % pat.length) + pat.length) % pat.length] +
      12 * Math.floor(nh / pat.length);
    const [instrumentIndex, pitchOffset] = notes[i];
    return {
      padIndex,
      padName: PAD_NAMES[padIndex],
      instrumentIndex,
      instrumentName: getInstrumentName(instrumentIndex),
      pitchOffset,
      targetNote: noteName(opts.firstNote + h),
    };
  });
}

/** Apply the scale to instrument A of the affected pads in the given kit. */
export function applyScaleToKit(
  backup: Backup,
  kitIndex: number,
  opts: ScaleOptions,
): ScaleStep[] {
  const steps = computeScale(opts);
  for (const s of steps) {
    const pad = backup.getPad(kitIndex, s.padIndex);
    pad.setPatch(s.instrumentIndex, 0);
    pad.setPitch(s.pitchOffset, 0);
  }
  return steps;
}
