// File open/save that works both as a Tauri desktop app (native dialogs + full
// filesystem access via Rust commands) and as a plain web app (browser file
// input + Blob download fallback).

export interface OpenedFile {
  name: string;
  bytes: Uint8Array;
}

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function baseName(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

/** Open a binary file. `extensions` like ["HS0"] / ["kit"] (no dot). */
export async function openBinaryFile(
  extensions: string[],
  title: string,
): Promise<OpenedFile | null> {
  if (isTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const { invoke } = await import("@tauri-apps/api/core");
    const selected = await open({
      multiple: false,
      directory: false,
      title,
      filters: [{ name: extensions.join("/"), extensions }],
    });
    if (typeof selected !== "string") return null;
    const data = await invoke<number[]>("read_file_bytes", { path: selected });
    return { name: baseName(selected), bytes: new Uint8Array(data) };
  }

  // Browser fallback: hidden <input type=file>.
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = extensions.map((e) => "." + e).join(",");
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return resolve(null);
      resolve({ name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) });
    };
    input.click();
  });
}

/** Save bytes. In Tauri shows a native Save dialog; in the browser downloads the file. */
export async function saveBinaryFile(
  bytes: Uint8Array,
  defaultName: string,
  extensions: string[],
  title: string,
): Promise<boolean> {
  if (isTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { invoke } = await import("@tauri-apps/api/core");
    const path = await save({
      defaultPath: defaultName,
      title,
      filters: [{ name: extensions.join("/"), extensions }],
    });
    if (!path) return false;
    await invoke("write_file_bytes", { path, contents: Array.from(bytes) });
    return true;
  }

  const blob = new Blob([bytes as unknown as BlobPart], {
    type: "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = defaultName;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
