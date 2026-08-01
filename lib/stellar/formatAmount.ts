// String-based Stellar asset amount formatter.
// - Operates on decimal strings (no Number/float conversion).
// - Trims trailing fractional zeros for display.
// - Keeps very small (e.g. 0.0000001) and up-to-7-decimal values exact.
// - Produces a compact display if result is too long so layouts won't break.
// - Returns { display, raw } where `raw` is the original input (for copy/accessibility).

export interface FormattedAmount {
  display: string;
  raw: string; // original input, unmodified
  malformed?: boolean;
}

const DECIMAL_RE = /^-?\d+(\.\d+)?$/;

/** Insert grouping separators into integer part (e.g., "1234567" -> "1,234,567") */
function groupIntegerPart(intPart: string): string {
  // handle optional leading '-' sign (shouldn't be in intPart here, but guard anyway)
  const negative = intPart.startsWith("-");
  const int = negative ? intPart.slice(1) : intPart;
  const reversed = int.split("").reverse();
  const grouped: string[] = [];
  for (let i = 0; i < reversed.length; i++) {
    grouped.push(reversed[i]);
    if ((i + 1) % 3 === 0 && i !== reversed.length - 1) grouped.push(",");
  }
  const result = grouped.reverse().join("");
  return negative ? "-" + result : result;
}

/** Compact middle of a long string to fit maxLen, preserving start and end context. */
function compactMiddle(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  if (maxLen <= 3) return "…" ; // extreme edge
  const keep = Math.floor((maxLen - 1) / 2);
  const start = s.slice(0, keep);
  const end = s.slice(s.length - (maxLen - 1 - keep));
  return `${start}…${end}`;
}

/**
 * Main formatting function.
 * - maxDisplayLength: cap for the displayed string length to avoid layout breakage.
 */
export function formatAssetAmount(amount: string, maxDisplayLength = 20): FormattedAmount {
  const raw = amount ?? "";
  if (!DECIMAL_RE.test(raw)) {
    // Malformed: return as-is, but mark it so callers can optionally style it.
    return { display: raw, raw, malformed: true };
  }

  // Split into sign, integer, fraction
  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const [rawInt, rawFrac = ""] = unsigned.split(".");

  // Remove leading zeros from integer part but keep at least one zero
  const intPart = rawInt.replace(/^0+(?!$)/, "") || "0";

  // Fractional: trim trailing zeros for display
  const fracTrimmed = rawFrac.replace(/0+$/, "");

  // Build display parts
  const groupedInt = groupIntegerPart(negative ? "-" + intPart : intPart);

  let display = groupedInt;
  if (rawFrac.length > 0) {
    if (fracTrimmed.length > 0) {
      display = `${groupedInt}.${fracTrimmed}`;
    } else {
      // had fraction but became zero -> display integer only
      display = groupedInt;
    }
  }

  // If display is too long, produce a compact representation
  // but only compact the display — raw always remains available for copy/title.
  const finalDisplay = display.length > maxDisplayLength ? compactMiddle(display, maxDisplayLength) : display;

  return { display: finalDisplay, raw, malformed: false };
}
