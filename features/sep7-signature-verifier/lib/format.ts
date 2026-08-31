/** Presentation-only helpers. Keep formatting out of components and logic. */
export function formatDomain(value: string): string { return value.trim().toLowerCase(); }
export function formatKey(value: string): string { return value; }
export function formatTomlUrl(value: string): string { return value; }
