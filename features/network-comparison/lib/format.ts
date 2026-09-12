import { copy } from "@/features/network-comparison/copy";

const STROOPS_PER_XLM = 10_000_000n;

/**
 * Converts a stroop integer string into an exact decimal XLM representation.
 *
 * @param stroops - The stroop value as a numeric string.
 * @returns Formatted XLM string.
 */
export function stroopsToXlm(stroops: string): string {
  const value = BigInt(stroops);
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const whole = abs / STROOPS_PER_XLM;
  const fraction = (abs % STROOPS_PER_XLM).toString().padStart(7, "0");
  const trimmed = fraction.replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole}${trimmed ? `.${trimmed}` : ".0"} XLM`;
}

/**
 * Formats a ledger sequence number with locale grouping.
 *
 * @param sequence - The ledger sequence or null.
 * @returns Formatted sequence string or unavailable indicator.
 */
export function formatLedgerSequence(sequence: number | null): string {
  if (sequence === null || sequence === undefined) return copy.unavailable;
  return `#${sequence.toLocaleString("en-US")}`;
}

/**
 * Formats a protocol version number.
 *
 * @param version - The protocol version or null.
 * @returns Formatted protocol version string.
 */
export function formatProtocolVersion(version: number | null): string {
  if (version === null || version === undefined) return copy.unavailable;
  return `Protocol ${version}`;
}

/**
 * Formats a base fee amount in stroops and XLM using integer arithmetic.
 *
 * @param stroops - The base fee in stroops as a string or null.
 * @returns Formatted fee string or unavailable indicator.
 */
export function formatFeeAmount(stroops: string | null): string {
  if (stroops === null || stroops === undefined) return copy.unavailable;
  const num = BigInt(stroops);
  const formatted = num.toLocaleString("en-US");
  return `${formatted} stroops (${stroopsToXlm(stroops)})`;
}

/**
 * Formats a base reserve amount in stroops and XLM using integer arithmetic.
 *
 * @param stroops - The base reserve in stroops as a string or null.
 * @returns Formatted reserve string or unavailable indicator.
 */
export function formatReserveAmount(stroops: string | null): string {
  if (stroops === null || stroops === undefined) return copy.unavailable;
  const num = BigInt(stroops);
  const formatted = num.toLocaleString("en-US");
  return `${formatted} stroops (${stroopsToXlm(stroops)})`;
}

/**
 * Formats ingestion health based on latest ingested vs history ledger.
 *
 * @param ingest - The latest ingested ledger sequence.
 * @param history - The latest history ledger sequence.
 * @returns Human-readable ingestion status string.
 */
export function formatIngestionState(ingest: number | null, history: number | null): string {
  if (ingest === null || history === null || ingest === undefined || history === undefined) {
    return copy.unavailable;
  }
  if (ingest >= history - 1) {
    return copy.ingestionUpToDate;
  }
  const lag = history - ingest;
  return copy.ingestionLagging(lag);
}

/**
 * Formats an observation timestamp.
 *
 * @param timestamp - The timestamp string or null.
 * @returns Formatted observation string or unavailable indicator.
 */
export function formatObservationTime(timestamp: string | null): string {
  if (!timestamp) return copy.unavailable;
  return timestamp;
}

/**
 * Formats the difference between two stroop values.
 *
 * @param diffStroops - Difference in stroops as a string or null.
 * @returns Formatted difference string or unavailable indicator.
 */
export function formatAmountDifference(diffStroops: string | null): string {
  if (diffStroops === null || diffStroops === undefined) return copy.unavailable;
  const diff = BigInt(diffStroops);
  if (diff === 0n) return copy.identical;
  const absStr = (diff < 0n ? -diff : diff).toString();
  const sign = diff > 0n ? "+" : "-";
  return `${sign}${formatFeeAmount(absStr)}`;
}
