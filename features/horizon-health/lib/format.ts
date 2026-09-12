/** Formats an integer ledger sequence with localized group separators. */
export function formatLedgerNumber(sequence: number | string): string {
  try {
    return BigInt(sequence).toLocaleString("en-US");
  } catch {
    return String(sequence);
  }
}

/** Formats the elder and latest ledger sequences into an inclusive range string. */
export function formatLedgerRange(elder: number | string, latest: number | string): string {
  return `${formatLedgerNumber(elder)} – ${formatLedgerNumber(latest)}`;
}

/** Formats an ingestion ledger gap into human-readable text. */
export function formatLag(lag: number): string {
  if (lag <= 0) {
    return "0 ledgers (in sync)";
  }
  if (lag === 1) {
    return "1 ledger behind";
  }
  return `${lag} ledgers behind`;
}

/** Formats an HTTP rate-limit reset value into a duration or localized time. */
export function formatRateLimitReset(reset: string | null): string {
  if (!reset) {
    return "—";
  }
  const numeric = Number(reset);
  if (!Number.isFinite(numeric)) {
    return reset;
  }
  if (numeric > 1_000_000_000) {
    return new Date(numeric * 1000).toISOString().replace("T", " ").replace(/\..+/, " UTC");
  }
  return `${numeric}s`;
}

/** Formats an ISO 8601 timestamp string into readable UTC display format. */
export function formatTimestamp(isoString: string): string {
  try {
    const parsed = new Date(isoString);
    if (Number.isNaN(parsed.getTime())) {
      return isoString;
    }
    return parsed.toISOString().replace("T", " ").replace(/\..+/, " UTC");
  } catch {
    return isoString;
  }
}
