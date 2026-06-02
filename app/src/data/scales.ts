// Melodic scale helpers for TriggerMap.
//  - MELODIC_SETS: the index ranges of each pitched instrument family in the
//    Roland HPD-20 Sound List (factual product data; see instruments.ts).
//  - SCALE_PATTERNS / MODES: standard music theory.
//  - MELODY_PAD_PATTERNS: our own pad orderings (note -> pad index).
//  - getScale(): our own nearest-pitch selection.
import { getInstrumentPitch } from "./instruments";

export const MODES = {
  IONIAN: 0,
  DORIAN: 1,
  PHRYGIAN: 2,
  LYDIAN: 3,
  MIXOLYDIAN: 4,
  AEOLIAN: 5,
  LOCRIAN: 6,
} as const;

// [firstInstrumentIndex, lastInstrumentIndex] (0-based) of each pitched family.
export const MELODIC_SETS: Record<string, [number, number]> = {
  "Steel Drum": [348, 355],
  Balaphone: [356, 361],
  "Slit Drum": [362, 366],
  Gyilli: [367, 371],
  Lithophone: [372, 376],
  Khongwong: [377, 381],
  Kalimba: [382, 386],
  Santoor: [387, 395],
  "Hand Pan": [396, 403],
  "Tone Plate": [404, 408],
  Vibraphone: [409, 417],
  Marimba: [418, 427],
  Glockenspiel: [428, 433],
  "Tubular Bells": [434, 435],
};

export const SCALE_PATTERNS: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 9, 10],
  "harmonic minor": [0, 2, 3, 5, 7, 9, 11],
  "pentatonic major": [0, 2, 4, 7, 9],
  "pentatonic minor": [0, 3, 5, 7, 10],
};

// Our own orderings: which pad receives the 1st, 2nd, … note of the scale.
// Pad indices: 0–4 = M1–M5, 5–12 = S1–S8, 13 = D-Beam.
export const MELODY_PAD_PATTERNS: Record<string, number[]> = {
  "M1–M5, S1–S8": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  "Nur S1–S8": [5, 6, 7, 8, 9, 10, 11, 12],
  "Im Uhrzeigersinn": [0, 2, 5, 6, 7, 8, 9, 10, 11, 12, 3, 1, 4],
};

// Note naming consistent with the instrument table (semitone number, C4 = 72).
const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

export const PITCH_CLASSES = NOTE_NAMES;

/** Human note name for a semitone number, e.g. 72 -> "C4". */
export function noteName(value: number): string {
  if (value < 0) return "--";
  return NOTE_NAMES[((value % 12) + 12) % 12] + Math.floor((value - 24) / 12);
}

/** Build the semitone number for a pitch class (0=C..11=B) in a given octave. */
export function noteNumber(pitchClass: number, octave: number): number {
  return 24 + 12 * octave + pitchClass;
}

/** Pick the instrument index in [low,high] whose base pitch is closest to `idealCents`. */
function nearestNoteAndPitch(
  low: number,
  high: number,
  idealCents: number,
): [number, number] {
  let bestPitch = idealCents - getInstrumentPitch(low);
  let bestIndex = low;
  for (let i = low + 1; i <= high; i++) {
    const delta = idealCents - getInstrumentPitch(i);
    if (Math.abs(delta) < Math.abs(bestPitch)) {
      bestPitch = delta;
      bestIndex = i;
    }
  }
  return [bestIndex, bestPitch];
}

/**
 * Compute [instrumentIndex, pitchCentsOffset] for each note of a scale.
 * firstNote is a semitone number (C4 = 72); result length = noteCount.
 */
export function getScale(
  instrumentName: string,
  firstNote: number,
  noteCount: number,
  scaleName: string,
  mode: number = MODES.IONIAN,
): [number, number][] {
  const pattern = SCALE_PATTERNS[scaleName];
  const [low, high] = MELODIC_SETS[instrumentName];
  const out: [number, number][] = [];
  for (let i = 0; i < noteCount; i++) {
    const nh = i + mode;
    const step =
      pattern[((nh % pattern.length) + pattern.length) % pattern.length] +
      12 * Math.floor(nh / pattern.length);
    out.push(nearestNoteAndPitch(low, high, (firstNote + step) * 100));
  }
  return out;
}
