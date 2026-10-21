import { err, ok, type Result } from "@/core/result/result";

/** SEP-29 data entry name. The only defined value is the single character "1". */
export const MEMO_REQUIRED_KEY = "config.memo_required";
export const MEMO_REQUIRED_VALUE = "1";

export type DataEntrySignal = "required" | "absent";

/**
 * Reads the SEP-29 data entry.
 * A missing key is an absent signal. Any other value is malformed, not "not required".
 */
export function readMemoRequiredFlag(
  data: Record<string, string>
): Result<DataEntrySignal, "malformed_data_entry"> {
  if (!Object.prototype.hasOwnProperty.call(data, MEMO_REQUIRED_KEY)) return ok("absent");

  const raw = data[MEMO_REQUIRED_KEY];
  let text: string;
  try {
    text = decodeHorizonValue(raw);
  } catch {
    return err("malformed_data_entry");
  }

  if (text !== MEMO_REQUIRED_VALUE) return err("malformed_data_entry");
  return ok("required");
}

function decodeHorizonValue(rawBase64: string): string {
  const binary = atob(rawBase64);
  if (btoa(binary) !== rawBase64) throw new Error("malformed");
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return text;
}
