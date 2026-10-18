import { copy } from "../copy";
export function formatHeader(value: string | null): string { return value === null ? copy.unavailable : value; }
