import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { TomlValidatorErrorCode, TomlValidatorInput } from "@/features/toml-validator/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseTomlValidatorInput(raw: string): Result<TomlValidatorInput, TomlValidatorErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  if (/^S[A-Z2-7]{10,}$/i.test(value)) return err("toml_invalid");
  const mode = /(?:^|\n)\s*(?:\[|[A-Z0-9_]+\s*=)/.test(raw) ? "toml" : "domain";
  if (mode === "toml") return ok({ value: raw.trim(), mode });
  if (/^http:\/\//i.test(value)) return err("invalid_domain");
  try {
    const candidate = /^https:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(candidate);
    if (url.protocol !== "https:") return err("invalid_domain");
    if (!url.hostname || url.hostname === "localhost" || url.hostname.includes("_")) return err("invalid_domain");
    return ok({ value: url.hostname.toLowerCase(), mode });
  } catch { return err("invalid_domain"); }
}
