/**
 * Formats a 64-bit integer string with thousands separators.
 */
export function formatMuxedId(id: string): string {
  try {
    const value = BigInt(id);
    return value.toLocaleString("en-US");
  } catch {
    return id;
  }
}

/**
 * Formats a 64-bit integer string in zero-padded 16-character hexadecimal notation (0x...).
 */
export function formatHexMuxedId(id: string): string {
  try {
    const value = BigInt(id);
    return `0x${value.toString(16).toUpperCase().padStart(16, "0")}`;
  } catch {
    return id;
  }
}
