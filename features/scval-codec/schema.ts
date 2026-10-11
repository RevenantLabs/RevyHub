import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type {
  ScvalCodecErrorCode,
  ScvalCodecInput,
  ScvalCodecMode
} from "@/features/scval-codec/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseScvalCodecInput(
  rawValue: string,
  rawMode: string
): Result<ScvalCodecInput, ScvalCodecErrorCode> {
  const value = normalizeInput(rawValue);
  if (!value) return err("empty_input");

  const mode = rawMode.trim().toLowerCase() as ScvalCodecMode;
  if (mode !== "decode" && mode !== "encode") return err("invalid_json");

  return ok({ value, mode });
}
