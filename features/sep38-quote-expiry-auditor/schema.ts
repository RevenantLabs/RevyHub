import { err, ok, type Result } from "@/core/result/result"
import type { Sep38ErrorCode, Sep38Input } from "@/features/sep38-quote-expiry-auditor/types"

export const MAX_QUOTE_JSON_LENGTH = 20_000
export const MAX_ANCHOR_ID_LENGTH = 128

const SECRET_SEED = /^S[A-Z2-7]{55}$/

export interface RawSep38Input {
  anchorId: string
  evaluationTime: string
  quoteJson: string
}

function containsSecretSeed(value: string): boolean {
  return value.split(/\s+/).some((token) => SECRET_SEED.test(token))
}

export function parseSep38Input(raw: RawSep38Input): Result<Sep38Input, Sep38ErrorCode> {
  const anchorId = raw.anchorId.trim()
  const evaluationTime = raw.evaluationTime.trim()
  const quoteJson = raw.quoteJson.trim()

  if (!anchorId || !evaluationTime || !quoteJson) return err("empty_input")
  if (containsSecretSeed(anchorId) || containsSecretSeed(quoteJson) || containsSecretSeed(evaluationTime)) {
    return err("invalid_input")
  }
  if (anchorId.length > MAX_ANCHOR_ID_LENGTH || quoteJson.length > MAX_QUOTE_JSON_LENGTH) {
    return err("too_large")
  }
  if (anchorId.startsWith("S")) return err("invalid_input")

  return ok({ anchorId, evaluationTime, quoteJson })
}
