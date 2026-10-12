/** Trigger a browser download for an in-memory file. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next tick so Safari has time to start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function saveTextFile(text: string, filename: string): void {
  saveBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}

const FILENAME_PATTERN = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i;

export function filenameFromDisposition(header: string | null, fallback: string): string {
  const match = header?.match(FILENAME_PATTERN);
  const raw = match?.[1];
  return raw ? decodeURIComponent(raw.trim()) : fallback;
}
