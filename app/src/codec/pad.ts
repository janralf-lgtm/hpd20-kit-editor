import { PadField, OFF_INSTRUMENT } from "./layout";
import * as M from "./memoryOps";
import { getInstrumentName, getInstrumentPitch } from "../data/instruments";

/**
 * Live view onto one 68-byte pad block inside the backup buffer.
 * All setters write through to `buf` immediately (in-place editing).
 */
export class PadAccessor {
  buf: Uint8Array;
  base: number;
  constructor(buf: Uint8Array, base: number) {
    this.buf = buf;
    this.base = base;
  }

  // --- layered fields (layer 0 = instrument A, 1 = instrument B) ---
  getVolume(layer = 0): number {
    return M.getUint8(this.buf, this.base + PadField.VOLUME + layer);
  }
  setVolume(value: number, layer = 0): void {
    M.setUint8(this.buf, this.base + PadField.VOLUME + layer, value);
  }

  getPan(layer = 0): number {
    return M.getInt8(this.buf, this.base + PadField.PAN + layer);
  }
  setPan(value: number, layer = 0): void {
    M.setInt8(this.buf, this.base + PadField.PAN + layer, value);
  }

  getPatch(layer = 0): number {
    return M.getUint16(this.buf, this.base + PadField.PATCH + layer * 2);
  }
  setPatch(value: number, layer = 0): void {
    M.setUint16(this.buf, this.base + PadField.PATCH + layer * 2, value);
  }

  getInternalPatch(layer = 0): number {
    return M.getUint16(this.buf, this.base + PadField.PATCH_INTERNAL + layer * 2);
  }
  setInternalPatch(value: number, layer = 0): void {
    M.setUint16(this.buf, this.base + PadField.PATCH_INTERNAL + layer * 2, value);
  }

  /** Raw pitch offset in cents stored for this pad (relative to the instrument base). */
  getPitch(layer = 0): number {
    return M.getInt16(this.buf, this.base + PadField.PITCH + layer * 2);
  }
  setPitch(value: number, layer = 0): void {
    M.setInt16(this.buf, this.base + PadField.PITCH + layer * 2, value);
  }

  getMuffling(layer = 0): number {
    return M.getUint8(this.buf, this.base + PadField.MUFFLING + layer);
  }
  getColor(layer = 0): number {
    return M.getUint8(this.buf, this.base + PadField.COLOR + layer);
  }
  getSweep(layer = 0): number {
    return M.getUint8(this.buf, this.base + PadField.SWEEP + layer);
  }

  // --- single-value fields ---
  getMidiNote(): number {
    return M.getUint8(this.buf, this.base + PadField.MIDI_NOTE);
  }

  getLayerMode(): number {
    return M.getUint8(this.buf, this.base + PadField.LAYER);
  }
  setLayerMode(value: number): void {
    M.setUint8(this.buf, this.base + PadField.LAYER, value);
  }

  getFadePoint(): number {
    return M.getUint8(this.buf, this.base + PadField.FADE_VALUE);
  }
  setFadePoint(value: number): void {
    M.setUint8(this.buf, this.base + PadField.FADE_VALUE, value);
  }

  // --- derived helpers ---
  getInstrumentName(layer = 0): string {
    return getInstrumentName(this.getPatch(layer));
  }

  /** True when no instrument is assigned to this layer (device "Off" value). */
  isEmpty(layer = 0): boolean {
    return this.getPatch(layer) === OFF_INSTRUMENT;
  }

  /** Absolute pitch in cents = instrument base pitch + stored offset. */
  getAbsolutePitch(layer = 0): number {
    return getInstrumentPitch(this.getPatch(layer)) + this.getPitch(layer);
  }
}
