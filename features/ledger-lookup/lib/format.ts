/** Formats a Stellar 7-decimal-place amount string without precision loss. */
export function formatAmount(value: string): string {
  const [whole, fraction = ""] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmed = fraction.replace(/0+$/, "");
  return trimmed ? `${grouped}.${trimmed}` : grouped;
}

/** Converts stroops to an XLM decimal string using BigInt arithmetic. */
export function stroopsToXlm(stroops: string | number | bigint): string {
  const value = BigInt(stroops);
  const whole = value / 10_000_000n;
  const fraction = (value % 10_000_000n).toString().padStart(7, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

/** Formats a stroop amount with its corresponding XLM equivalent. */
export function formatStroops(stroops: string | number | bigint): string {
  const str = String(stroops);
  const grouped = str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${grouped} stroops (${formatAmount(stroopsToXlm(stroops))} XLM)`;
}

/** Formats an ISO-8601 timestamp in UTC. */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

/** Formats the elapsed duration between an ISO timestamp and a reference time. */
export function formatRelativeAge(iso: string, nowMs: number = Date.now()): string {
  const date = new Date(iso);
  const time = date.getTime();
  if (Number.isNaN(time)) return "Unknown";

  const diffSeconds = Math.max(0, Math.floor((nowMs - time) / 1000));
  if (diffSeconds < 5) return "just now";
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;

  const years = Math.floor(days / 365);
  if (years === 1) return "1 year ago";
  return `${years} years ago`;
}

/** Formats an integer with thousands grouping. */
export function formatInteger(value: number | bigint | string): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
