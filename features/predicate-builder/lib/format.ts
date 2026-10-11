/**
 * Formats a Unix timestamp (seconds) to ISO 8601 with timezone.
 */
export function formatTimestamp(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  return date.toISOString();
}

/**
 * Formats a duration in seconds for display.
 */
export function formatSeconds(seconds: number): string {
  if (seconds === 1) return "1 second";
  if (seconds < 60) return `${seconds} seconds`;
  
  if (seconds % 86400 === 0) {
    const days = seconds / 86400;
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  
  if (seconds % 3600 === 0) {
    const hours = seconds / 3600;
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  
  return `${seconds} seconds`;
}
