// Asset-amount formatting helpers used across Balance Viewer, Transaction
// Lookup, and any future Horizon-backed tool that surfaces a numeric balance.
//
// Stellar balances and fees arrive from Horizon as decimal strings (native
// XLM uses seven decimals; most issued assets use the same precision or
// fewer). Converting those strings through JavaScript `Number` quickly loses
// precision for the very large integer range that Stellar uses (int64 stroop
// counts and asset amounts). These helpers keep all arithmetic in integer
// string math so full precision is preserved.

const NATIVE_DECIMALS = 7;

export interface FormatAssetAmountOptions {
  /**
   * Maximum decimal digits kept after the decimal point. Inputs are truncated
   * if they exceed this value. Defaults to 7, matching Stellar's native XLM
   * precision. Lower values are useful for assets that use fewer decimals.
   */
  maxDecimals?: number;
  /**
   * When true (default), trailing zeros after the decimal point are removed
   * along with the decimal point itself when the fractional part becomes
   * empty. Disable to keep the input's exact authored precision.
   */
  trimTrailingZeros?: boolean;
}

/**
 * Format a Stellar decimal-string asset amount for display while preserving
 * exact precision up to `options.maxDecimals` (default seven).
 *
 * Uses integer string arithmetic — never converts to a binary float — so the
 * full Stellar range (including issued-asset balances and liquidity pool
 * shares) can be rendered without precision loss.
 *
 * Empty, malformed, or non-numeric inputs return the original input string so
 * callers can surface the raw value as-is (for example, in error states).
 *
 * @example formatAssetAmount("100.0000000")  // "100"
 * @example formatAssetAmount("0.5000000")    // "0.5"
 * @example formatAssetAmount("100.0000001")  // "100.0000001"
 * @example formatAssetAmount("0.12345678")   // "0.1234567"  (truncated to seven)
 */
export function formatAssetAmount(
  value: string,
  options: FormatAssetAmountOptions = {}
): string {
  // Pass-through non-string inputs verbatim so unusual callers don't lose
  // the original value (or its undefined/null status) when the formatter
  // bails out.
  if (typeof value !== "string") {
    return value as string;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return value;
  }

  // Reject scientific notation, sign placement quirks, commas, anything
  // outside the strict integer-with-optional-fraction shape.
  if (!/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return value;
  }

  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const maxDecimals = options.maxDecimals ?? NATIVE_DECIMALS;
  const trimZeros = options.trimTrailingZeros ?? true;

  if (/^0(?:\.0+)?$/.test(unsigned)) {
    return "0";
  }

  const [intPartRaw, fracPartRaw = ""] = unsigned.split(".");
  const fracSliced = fracPartRaw.slice(0, maxDecimals);
  const formatted = joinDecimal(intPartRaw, fracSliced, trimZeros);

  return negative && formatted !== "0" ? `-${formatted}` : formatted;
}

/**
 * Format an integer count of Stellar stroops as a human-readable XLM amount.
 * Uses integer string division — never a binary float — so the full 64-bit
 * stroop range is supported without precision loss.
 *
 * Empty or non-integer inputs return the raw input so callers can surface
 * the original value (for example, in error states).
 *
 * @example formatStroopsAsXLM("10000000") // "1"
 * @example formatStroopsAsXLM("100")      // "0.00001"
 * @example formatStroopsAsXLM("0")        // "0"
 */
export function formatStroopsAsXLM(
  stroops: string,
  options: FormatAssetAmountOptions = {}
): string {
  // Pass-through non-string inputs verbatim so unusual callers don't lose
  // the original value when the formatter bails out.
  if (typeof stroops !== "string") {
    return stroops as string;
  }

  const trimmed = stroops.trim();

  if (!trimmed) {
    return stroops;
  }

  // Reject signs, decimals, scientific notation. Allow only unsigned integers.
  if (!/^\d+$/.test(trimmed)) {
    return stroops;
  }

  if (trimmed === "0") {
    return "0";
  }

  const maxDecimals = options.maxDecimals ?? NATIVE_DECIMALS;
  const trimZeros = options.trimTrailingZeros ?? true;

  // Insert a decimal point so the last `maxDecimals` digits become the
  // fractional part. Pad with leading zeros for counts smaller than the
  // requested precision so the integer portion stays at zero.
  const padded = trimmed.padStart(maxDecimals, "0");
  const cut = padded.length - maxDecimals;
  const whole = padded.slice(0, cut);
  const frac = padded.slice(cut);
  const fracSliced = frac.slice(0, maxDecimals);
  const formatted = joinDecimal(whole, fracSliced, trimZeros);

  return formatted;
}

function joinDecimal(
  intPart: string,
  fracPart: string,
  trimZeros: boolean
): string {
  // Strip leading zeros from the integer portion but keep at least one digit
  // so "0.5" doesn't become ".5".
  let safeInt: string;

  if (intPart === "0" || intPart === "") {
    safeInt = "0";
  } else {
    safeInt = intPart.replace(/^0+(?=\d)/, "") || "0";
  }

  const frac = trimZeros ? fracPart.replace(/0+$/, "") : fracPart;
  return frac ? `${safeInt}.${frac}` : safeInt;
}
