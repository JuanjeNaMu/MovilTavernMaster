function sniffImageMimeFromBase64Payload(b64: string): string {
  const head = b64.slice(0, 32);
  if (head.startsWith("/9j") || head.startsWith("/9j/")) return "image/jpeg";
  if (head.startsWith("iVBOR")) return "image/png";
  if (head.startsWith("R0lGOD")) return "image/gif";
  if (head.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}

export function extractRawBase64ForApi(stored: string | null | undefined): string | null {
  if (stored == null) return null;
  const t = String(stored).trim();
  if (t === "") return null;
  if (t.startsWith("data:")) {
    const idx = t.indexOf("base64,");
    if (idx !== -1) return t.slice(idx + 7).replace(/\s/g, "");
  }
  return t.replace(/\s/g, "");
}

export function dataUriFromStoredBase64(stored: string | null | undefined): string | undefined {
  if (stored == null) return undefined;
  const t = String(stored).trim();
  if (t === "") return undefined;
  if (t.startsWith("data:")) return t;
  const payload = t.replace(/\s/g, "");
  if (payload.length < 8) return undefined;
  const mime = sniffImageMimeFromBase64Payload(payload);
  return `data:${mime};base64,${payload}`;
}
