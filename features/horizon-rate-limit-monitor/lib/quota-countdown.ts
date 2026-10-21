/** Horizon reset is Unix seconds; expired resets never produce negative durations. */
export function quotaCountdown(reset: string | null, nowMs: number): string | null {
  if (reset === null || !/^(0|[1-9]\d*)$/.test(reset)) return null;
  const epoch = Number(reset);
  if (!Number.isSafeInteger(epoch) || epoch > Number.MAX_SAFE_INTEGER / 1000) return null;
  const seconds = Math.max(0, Math.ceil((epoch * 1000 - nowMs) / 1000));
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ${seconds % 60}s`;
}
