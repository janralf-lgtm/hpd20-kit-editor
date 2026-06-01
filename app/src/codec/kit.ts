import { KitField } from "./layout";
import * as M from "./memoryOps";

/** Live view onto one 224-byte kit block inside the backup buffer. */
export class KitAccessor {
  buf: Uint8Array;
  base: number;
  constructor(buf: Uint8Array, base: number) {
    this.buf = buf;
    this.base = base;
  }

  getName(): string {
    return M.getString(this.buf, this.base + KitField.NAME, KitField.NAME_LEN);
  }
  setName(value: string): void {
    M.setString(this.buf, this.base + KitField.NAME, KitField.NAME_LEN, value);
  }

  getSubName(): string {
    return M.getString(
      this.buf,
      this.base + KitField.SUBNAME,
      KitField.SUBNAME_LEN,
    );
  }
  setSubName(value: string): void {
    M.setString(
      this.buf,
      this.base + KitField.SUBNAME,
      KitField.SUBNAME_LEN,
      value,
    );
  }

  getVolume(): number {
    return M.getUint8(this.buf, this.base + KitField.VOLUME);
  }
  setVolume(value: number): void {
    M.setUint8(this.buf, this.base + KitField.VOLUME, value);
  }

  getHhVolume(): number {
    return M.getUint8(this.buf, this.base + KitField.HH_VOLUME);
  }
  getSensitivity(): number {
    return M.getUint8(this.buf, this.base + KitField.SENSITIVITY);
  }
  getBalance(): number {
    return M.getUint8(this.buf, this.base + KitField.BALANCE);
  }
}
