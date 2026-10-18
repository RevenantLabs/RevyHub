import type { TomlValidatorErrorCode } from "@/features/toml-validator/types";

/** Maps transport failures onto this tool's own error codes. */
export function toTomlValidatorErrorCode(error: unknown): TomlValidatorErrorCode {
  return error instanceof Error && error.name === "AbortError" ? "toml_unreachable" : "request_failed";
}
