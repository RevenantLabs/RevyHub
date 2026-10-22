export function formatEventPayload(payload: unknown): string { return JSON.stringify(payload, null, 2); }
export function formatEventCount(count: number): string { return `${count} event${count === 1 ? "" : "s"}`; }
