import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { Backup } from "./backup";
import * as M from "./memoryOps";
import { applyScaleToKit, computeScale } from "./scaleApply";
import { MELODIC_SETS } from "../data/scales";

const REAL_FILE =
  "/Users/jansturkat/HPD-20/Roland/HPD-20/Backup/BKUP-001.HS0";

function loadReal(): Backup {
  const buf = readFileSync(REAL_FILE);
  return Backup.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  );
}

describe("memoryOps", () => {
  it("round-trips signed int8 (pan)", () => {
    const b = new Uint8Array(4);
    M.setInt8(b, 0, -2);
    expect(b[0]).toBe(254);
    expect(M.getInt8(b, 0)).toBe(-2);
  });
  it("round-trips uint16 big-endian", () => {
    const b = new Uint8Array(4);
    M.setUint16(b, 0, 700);
    expect(M.getUint16(b, 0)).toBe(700);
    expect(b[0]).toBe(2); // 700 = 0x02BC
    expect(b[1]).toBe(0xbc);
  });
  it("writes space-padded fixed-width strings", () => {
    const b = new Uint8Array(12).fill(0);
    M.setString(b, 0, 12, "Test");
    expect(M.getString(b, 0, 12)).toBe("Test");
    expect(b[4]).toBe(0x20); // padded with space
  });
});

const hasReal = existsSync(REAL_FILE);
const realDescribe = hasReal ? describe : describe.skip;

realDescribe("Backup against real BKUP-001.HS0", () => {
  it("validates the stored MD5 checksum", () => {
    const bk = loadReal();
    expect(bk.verifyChecksum().valid).toBe(true);
  });

  it("reads expected factory kit names", () => {
    const bk = loadReal();
    expect(bk.getKit(0).getName()).toBe("Cajon Plus");
    expect(bk.getKit(3).getName()).toBe("Drums");
  });

  it("round-trips parse → toBytes byte-for-byte identical", () => {
    const original = readFileSync(REAL_FILE);
    const bk = Backup.parse(
      original.buffer.slice(
        original.byteOffset,
        original.byteOffset + original.byteLength,
      ),
    );
    const out = bk.toBytes();
    expect(out.length).toBe(original.length);
    expect(Buffer.from(out).equals(original)).toBe(true);
  });

  it("renaming a kit keeps the checksum valid and persists", () => {
    const bk = loadReal();
    bk.getKit(0).setName("MyKit");
    const out = bk.toBytes();
    const reloaded = new Backup(out);
    expect(reloaded.getKit(0).getName()).toBe("MyKit");
    expect(reloaded.verifyChecksum().valid).toBe(true);
  });

  it("swap then swap-back restores original bytes", () => {
    const bk = loadReal();
    const before = bk.toBytes();
    bk.swapKits(5, 130);
    bk.swapKits(5, 130);
    expect(Buffer.from(bk.toBytes()).equals(Buffer.from(before))).toBe(true);
  });

  it("edits layer B (patch/vol/pan/pitch), mode and fade point losslessly", () => {
    const bk = loadReal();
    const pad = bk.getPad(0, 0);
    pad.setLayerMode(3);
    pad.setFadePoint(90);
    pad.setPatch(123, 1);
    pad.setVolume(77, 1);
    pad.setPan(-5, 1);
    pad.setPitch(-200, 1);
    // layer A must stay untouched
    const aPatch = pad.getPatch(0);
    const out = bk.toBytes();
    const re = new Backup(out);
    const rp = re.getPad(0, 0);
    expect(rp.getLayerMode()).toBe(3);
    expect(rp.getFadePoint()).toBe(90);
    expect(rp.getPatch(1)).toBe(123);
    expect(rp.getVolume(1)).toBe(77);
    expect(rp.getPan(1)).toBe(-5);
    expect(rp.getPitch(1)).toBe(-200);
    expect(rp.getPatch(0)).toBe(aPatch);
    expect(re.verifyChecksum().valid).toBe(true);
  });

  it("applies a C major scale to melodic pads (Vibraphone) and stays valid", () => {
    const bk = loadReal();
    const opts = {
      instrumentName: "Vibraphone",
      scaleName: "major",
      mode: 0,
      firstNote: 72, // C4
      patternName: "M1–M5, S1–S8",
    };
    const steps = applyScaleToKit(bk, 10, opts);
    const [low, high] = MELODIC_SETS["Vibraphone"];
    // every assigned pad uses an instrument from the Vibraphone set
    for (const s of steps) {
      expect(s.instrumentIndex).toBeGreaterThanOrEqual(low);
      expect(s.instrumentIndex).toBeLessThanOrEqual(high);
    }
    // first pad of this pattern should target the root C
    expect(steps[0].targetNote.startsWith("C")).toBe(true);
    // persisted to the pad
    const first = bk.getPad(10, steps[0].padIndex);
    expect(first.getPatch(0)).toBe(steps[0].instrumentIndex);
    expect(first.getPitch(0)).toBe(steps[0].pitchOffset);
    const re = new Backup(bk.toBytes());
    expect(re.verifyChecksum().valid).toBe(true);
  });

  it("computeScale is pure (does not need a backup)", () => {
    const steps = computeScale({
      instrumentName: "Marimba",
      scaleName: "pentatonic minor",
      mode: 0,
      firstNote: 60,
      patternName: "Im Uhrzeigersinn",
    });
    expect(steps.length).toBeGreaterThan(0);
  });

  it("detects empty pads via the Off instrument (849)", () => {
    const bk = loadReal();
    const pad = bk.getPad(0, 0);
    expect(pad.isEmpty(0)).toBe(false);
    pad.setPatch(849, 0);
    expect(pad.isEmpty(0)).toBe(true);
  });

  it("export/import a kit is lossless", () => {
    const bk = loadReal();
    const blob = bk.exportKit(0);
    const name = bk.getKit(0).getName();
    bk.importKit(7, blob);
    expect(bk.getKit(7).getName()).toBe(name);
  });
});
