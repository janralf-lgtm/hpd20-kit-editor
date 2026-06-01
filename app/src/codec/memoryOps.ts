// Low-level big-endian read/write helpers over a Uint8Array.
// Mirrors memoryops.py from the reference tool (values are stored big-endian).

export function getUint8(buf: Uint8Array, i: number): number {
  return buf[i];
}

export function setUint8(buf: Uint8Array, i: number, value: number): void {
  buf[i] = value & 0xff;
}

export function getInt8(buf: Uint8Array, i: number): number {
  const v = buf[i];
  return v > 127 ? v - 256 : v;
}

export function setInt8(buf: Uint8Array, i: number, value: number): void {
  buf[i] = value & 0xff;
}

export function getUint16(buf: Uint8Array, i: number): number {
  return buf[i] * 256 + buf[i + 1];
}

export function setUint16(buf: Uint8Array, i: number, value: number): void {
  buf[i] = (value >> 8) & 0xff;
  buf[i + 1] = value & 0xff;
}

export function getInt16(buf: Uint8Array, i: number): number {
  const v = buf[i] * 256 + buf[i + 1];
  return v > 32767 ? v - 65536 : v;
}

export function setInt16(buf: Uint8Array, i: number, value: number): void {
  buf[i] = (value >> 8) & 0xff;
  buf[i + 1] = value & 0xff;
}

/** Read a fixed-width ASCII string, trimming trailing spaces/NULs. */
export function getString(buf: Uint8Array, i: number, len: number): string {
  let s = "";
  for (let k = 0; k < len; k++) {
    const c = buf[i + k];
    if (c === 0) break;
    s += String.fromCharCode(c);
  }
  return s.replace(/\s+$/, "");
}

/** Write an ASCII string into a fixed-width field, space-padded, truncated to len. */
export function setString(
  buf: Uint8Array,
  i: number,
  len: number,
  value: string,
): void {
  for (let k = 0; k < len; k++) {
    const c = k < value.length ? value.charCodeAt(k) & 0x7f : 0x20;
    buf[i + k] = c;
  }
}
