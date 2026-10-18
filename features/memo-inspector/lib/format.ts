/**
 * The live byte readout under the text field.
 *
 * A text memo is limited by bytes, so the count is always in bytes and the
 * overshoot is spelled out — "40 / 28 bytes" alone does not tell someone how
 * much to delete when every character they removed was worth four bytes.
 */
export function formatByteCount(bytes: number, max?: number): string {
  if (max === undefined) return `${bytes} ${bytes === 1 ? "byte" : "bytes"}`;
  if (bytes > max) return `${bytes} / ${max} bytes — ${bytes - max} over`;
  return `${bytes} / ${max} bytes`;
}

/** Groups hex into byte pairs so a reader can count the bytes: `00 00 00 01`. */
export function formatHexBytes(hex: string): string {
  return hex.match(/.{1,2}/g)?.join(" ") ?? "";
}

/** Renders a memo value for display, never showing an empty string as blank. */
export function formatMemoValue(value: string | null, fallback: string): string {
  return value === null || value === "" ? fallback : value;
}
