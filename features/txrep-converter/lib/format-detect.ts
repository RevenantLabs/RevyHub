export const MAX_INPUT_LENGTH = 65_536;

export type DetectedFormat = "xdr" | "txrep";

/** Base64 XDR is one token. Txrep is `field: value` lines. */
export function detectFormat(raw: string): DetectedFormat | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!trimmed.includes(":") && /^[A-Za-z0-9+/=\s]+$/.test(trimmed)) {
    const compact = trimmed.replace(/\s+/g, "");
    if (compact.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(compact)) return "xdr";
  }
  if (/^[A-Za-z_][\w.\[\]]*\s*:/m.test(trimmed)) return "txrep";
  return null;
}
