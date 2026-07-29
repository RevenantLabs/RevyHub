const STORAGE_KEY = "revyhub_recent_tools";
const MAX_RECENT_TOOLS = 5;

export interface RecentToolEntry {
  /** Tool route path (e.g., "/tools/address-validator") */
  routeId: string;
  /** ISO timestamp when the tool was last accessed */
  timestamp: string;
}

function isRecentToolEntry(entry: unknown): entry is RecentToolEntry {
  if (typeof entry !== "object" || entry === null) return false;
  const { routeId, timestamp } = entry as Record<string, unknown>;
  return typeof routeId === "string" && typeof timestamp === "string";
}

function parseStorage(value: string): RecentToolEntry[] {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentToolEntry);
  } catch {
    return [];
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "[]";
  }
}

/**
 * Retrieve stored recent tool entries.
 * Returns empty array if storage is unavailable or corrupted.
 */
export function getRecentTools(): RecentToolEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries = parseStorage(raw);
    // Sort by timestamp descending (most recent first)
    return entries.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Record a tool as recently used.
 * Only the routeId and timestamp are stored—no wallet addresses, form values, or sensitive data.
 * Deduplicates: if the tool was already in the list, it moves to the top.
 */
export function recordToolUse(routeId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentTools();
    const existingIndex = current.findIndex((e) => e.routeId === routeId);

    if (existingIndex !== -1) {
      // Move to front with updated timestamp
      current.splice(existingIndex, 1);
    }

    const entry: RecentToolEntry = {
      routeId,
      timestamp: new Date().toISOString()
    };

    const updated = [entry, ...current].slice(0, MAX_RECENT_TOOLS);
    window.localStorage.setItem(STORAGE_KEY, safeStringify(updated));
  } catch {
    // Silently ignore storage errors to preserve privacy guarantee
  }
}

/**
 * Clear all recent tool history.
 */
export function clearRecentTools(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently ignore storage errors
  }
}

/**
 * Validate that storage contains only privacy-safe data.
 * Returns true if storage is clean, false if it contains unexpected keys.
 */
export function validateRecentToolsStorage(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;

    const entries = parseStorage(raw);
    // Check that every entry only has the expected keys
    const testEntry = entries[0];
    if (!testEntry) return true;

    const allowedKeys = new Set(["routeId", "timestamp"]);
    const entryKeys = Object.keys(testEntry);
    const hasOnlyAllowedKeys = entryKeys.every((k) => allowedKeys.has(k));

    return hasOnlyAllowedKeys && entryKeys.length <= allowedKeys.size;
  } catch {
    return false;
  }
}
