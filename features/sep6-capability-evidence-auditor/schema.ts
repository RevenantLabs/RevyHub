import { err, ok, type Result } from "@/core/result/result"
import type { Sep6ErrorCode, Sep6Input } from "@/features/sep6-capability-evidence-auditor/types"

export const MAX_INFO_JSON_LENGTH = 40_000

const SECRET_SEED = /^S[A-Z2-7]{55}$/

export interface RawSep6Input {
  anchorUrl: string
  infoJson: string
}

function containsSecretSeed(value: string): boolean {
  return value.split(/\s+/).some((token) => SECRET_SEED.test(token))
}

export function parseSep6Input(raw: RawSep6Input): Result<Sep6Input, Sep6ErrorCode> {
  const anchorUrl = raw.anchorUrl.trim()
  const infoJson = raw.infoJson.trim()
  if (!anchorUrl || !infoJson) return err("empty_input")
  if (containsSecretSeed(anchorUrl) || containsSecretSeed(infoJson)) return err("invalid_input")
  if (infoJson.length > MAX_INFO_JSON_LENGTH || anchorUrl.length > 200) return err("too_large")

  let url: URL
  try {
    url = new URL(anchorUrl)
  } catch {
    return err("invalid_input")
  }
  if (url.protocol !== "https:") return err("unsupported_variant")

  return ok({ anchorUrl: url.toString(), infoJson })
}
