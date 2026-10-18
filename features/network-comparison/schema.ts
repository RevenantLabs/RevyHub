import { ok, type Result } from "@/core/result/result";
import type { NetworkComparisonInput, NetworkComparisonErrorCode } from "./types";
/** Both configured networks are fixed; the global switch supplies no input. */
export function parseNetworkComparisonInput(): Result<NetworkComparisonInput, NetworkComparisonErrorCode> { return ok({compare:true}); }
export function record(value: unknown): Record<string, unknown> | null {return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;}
export function unsigned(value: unknown): number | null {return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 4294967295 ? value : null;}
export function integerString(value: unknown): string | null {
 if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value).toString();
 return unsigned(value) === null ? null : String(value);
}
