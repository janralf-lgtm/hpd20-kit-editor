import { describe, it, expect, beforeEach } from "vitest";
import { checkCode } from "./supporter";

describe("supporter code", () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      /* node env may lack localStorage; checkCode doesn't use it */
    }
  });

  it("accepts the valid code (case-insensitive, trimmed)", async () => {
    expect(await checkCode("TRIGGERMAP-COFFEE")).toBe(true);
    expect(await checkCode("  triggermap-coffee  ")).toBe(true);
  });

  it("rejects wrong / empty codes", async () => {
    expect(await checkCode("nope")).toBe(false);
    expect(await checkCode("")).toBe(false);
    expect(await checkCode("TRIGGERMAP")).toBe(false);
  });
});
