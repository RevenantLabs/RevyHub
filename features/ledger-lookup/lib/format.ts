import { copy } from "../copy";
export function formatValue(value: string | number | null): string { return value === null ? copy.unavailable : String(value); }
export function formatAge(closedAt: string, observedAt: string): string {
 const seconds = Math.floor((Date.parse(observedAt)-Date.parse(closedAt))/1000);
 return !Number.isFinite(seconds) ? copy.unavailable : seconds < 0 ? copy.afterObservation : copy.secondsAgo(seconds);
}
