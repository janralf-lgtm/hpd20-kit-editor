// Lightweight "supporter" unlock: TriggerMap is free & fully functional; it shows
// a gentle donation hint that a Ko-fi supporter code hides permanently.
// This is NOT DRM — only a reminder is hidden. The app is open source, so we store
// just the SHA-256 hashes of accepted codes; the plaintext code is delivered to
// donors via Ko-fi's automatic thank-you message.

export const KOFI_URL = "https://ko-fi.com/janstuerkat";

const STORAGE_KEY = "triggermap-supporter";

// SHA-256 (of the normalized, upper-cased code) of accepted supporter codes.
// Add more entries to rotate/allow multiple codes.
const SUPPORTER_HASHES = [
  "ee239c326be97d338b96020a798160989e828c687c7de2fc8a55b7dd95a9d773",
];

export function isSupporter(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function normalize(code: string): string {
  return code.trim().toUpperCase();
}

async function sha256Hex(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** True if the code matches an accepted supporter code (case-insensitive). */
export async function checkCode(code: string): Promise<boolean> {
  if (!code.trim()) return false;
  const h = await sha256Hex(normalize(code));
  return SUPPORTER_HASHES.includes(h);
}

/** Validate and, on success, persist supporter status. Returns whether it matched. */
export async function redeemCode(code: string): Promise<boolean> {
  if (await checkCode(code)) {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    return true;
  }
  return false;
}
