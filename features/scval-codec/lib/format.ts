/**
 * Formatting helpers for the ScVal codec.
 *
 * The codec already returns pre-formatted strings (pretty JSON or base64),
 * so this file provides lightweight presentation utilities.
 */

export function formatByteLength(base64: string): string {
  const padding = (base64.match(/=/g) ?? []).length;
  const bytes = Math.floor(base64.length * 0.75) - padding;
  return `${bytes} byte${bytes === 1 ? "" : "s"}`;
}
