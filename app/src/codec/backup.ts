import SparkMD5 from "spark-md5";
import {
  KIT_OFFSET,
  KIT_SIZE,
  KITS_COUNT,
  KIT_FILE_SIZE,
  PAD_OFFSET,
  PAD_SIZE,
  PADS_PER_KIT,
  MD5_SIZE,
} from "./layout";
import { KitAccessor } from "./kit";
import { PadAccessor } from "./pad";

function kitBase(index: number): number {
  return KIT_OFFSET + KIT_SIZE * index;
}
function padBase(kitIndex: number, padIndex: number): number {
  return PAD_OFFSET + PAD_SIZE * (kitIndex * PADS_PER_KIT + padIndex);
}

/** Compute the 16-byte MD5 of `body` and return it as bytes. */
function md5Bytes(body: Uint8Array): Uint8Array {
  const copy = new ArrayBuffer(body.byteLength);
  new Uint8Array(copy).set(body);
  const hex = SparkMD5.ArrayBuffer.hash(copy);
  const out = new Uint8Array(MD5_SIZE);
  for (let i = 0; i < MD5_SIZE; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

export interface ChecksumInfo {
  stored: string;
  computed: string;
  valid: boolean;
}

/**
 * In-memory model of a full HPD-20 backup. Wraps the raw file bytes and edits
 * them in-place; never re-slices overlapping blocks. `toBytes()` recomputes the
 * trailing MD5 so the device accepts the file.
 */
export class Backup {
  /** Full file bytes including the trailing 16-byte MD5. */
  readonly bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
  }

  static parse(input: ArrayBuffer | Uint8Array): Backup {
    const src = input instanceof Uint8Array ? input : new Uint8Array(input);
    const bytes = new Uint8Array(src); // own copy
    if (bytes.length < KIT_OFFSET + KIT_SIZE * KITS_COUNT + MD5_SIZE) {
      throw new Error(
        `Datei zu klein (${bytes.length} Bytes) – ist das eine HPD-20 BKUP-XXX.HS0?`,
      );
    }
    return new Backup(bytes);
  }

  get body(): Uint8Array {
    return this.bytes.subarray(0, this.bytes.length - MD5_SIZE);
  }

  /** Verify the stored MD5 against a freshly computed one. */
  verifyChecksum(): ChecksumInfo {
    const stored = this.bytes.subarray(this.bytes.length - MD5_SIZE);
    const computed = md5Bytes(this.body);
    const hex = (b: Uint8Array) =>
      Array.from(b)
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
    const s = hex(stored);
    const c = hex(computed);
    return { stored: s, computed: c, valid: s === c };
  }

  kitCount(): number {
    return KITS_COUNT;
  }

  getKit(index: number): KitAccessor {
    return new KitAccessor(this.bytes, kitBase(index));
  }

  getPad(kitIndex: number, padIndex: number): PadAccessor {
    return new PadAccessor(this.bytes, padBase(kitIndex, padIndex));
  }

  // --- kit-level operations (move kit block + its 17 pad blocks together) ---

  /** Export a kit as a standalone 1380-byte blob (kit block + 17 pad blocks). */
  exportKit(index: number): Uint8Array {
    const out = new Uint8Array(KIT_FILE_SIZE);
    out.set(this.bytes.subarray(kitBase(index), kitBase(index) + KIT_SIZE), 0);
    for (let p = 0; p < PADS_PER_KIT; p++) {
      const src = padBase(index, p);
      out.set(
        this.bytes.subarray(src, src + PAD_SIZE),
        KIT_SIZE + p * PAD_SIZE,
      );
    }
    return out;
  }

  /** Write a 1380-byte kit blob into the given slot. */
  importKit(index: number, blob: Uint8Array): void {
    if (blob.length !== KIT_FILE_SIZE) {
      throw new Error(
        `Ungültige .kit-Datei: erwartet ${KIT_FILE_SIZE} Bytes, erhalten ${blob.length}.`,
      );
    }
    this.bytes.set(blob.subarray(0, KIT_SIZE), kitBase(index));
    for (let p = 0; p < PADS_PER_KIT; p++) {
      this.bytes.set(
        blob.subarray(KIT_SIZE + p * PAD_SIZE, KIT_SIZE + (p + 1) * PAD_SIZE),
        padBase(index, p),
      );
    }
  }

  copyKit(from: number, to: number): void {
    if (from === to) return;
    this.importKit(to, this.exportKit(from));
  }

  swapKits(a: number, b: number): void {
    if (a === b) return;
    const tmp = this.exportKit(a);
    this.importKit(a, this.exportKit(b));
    this.importKit(b, tmp);
  }

  /** Reorder: remove the kit at `from` and reinsert it at `to`, shifting the rest. */
  moveKit(from: number, to: number): void {
    if (from === to) return;
    const blobs = [];
    for (let i = 0; i < KITS_COUNT; i++) blobs.push(this.exportKit(i));
    const [moved] = blobs.splice(from, 1);
    blobs.splice(to, 0, moved);
    for (let i = 0; i < KITS_COUNT; i++) this.importKit(i, blobs[i]);
  }

  /** Serialize to a new byte array with a freshly computed trailing MD5. */
  toBytes(): Uint8Array {
    const out = new Uint8Array(this.bytes);
    const body = out.subarray(0, out.length - MD5_SIZE);
    out.set(md5Bytes(body), out.length - MD5_SIZE);
    return out;
  }
}
