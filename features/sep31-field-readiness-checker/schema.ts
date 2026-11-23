import { err, ok, type Result } from "@/core/result/result"
import type { FieldContext, Sep31ErrorCode, Sep31Input } from "@/features/sep31-field-readiness-checker/types"

export const MAX_JSON_LENGTH = 20_000

const SECRET_SEED = /^S[A-Z2-7]{55}$/
const ASSET_CODE = /^[A-Za-z0-9]{1,12}$/

export interface RawSep31Input {
  anchorId: string
  assetCode: string
  context: string
  requirementsJson: string
  fieldMapJson: string
}

function containsSecretSeed(value: string): boolean {
  return value.split(/\s+/).some((token) => SECRET_SEED.test(token))
}

export function parseSep31Input(raw: RawSep31Input): Result<Sep31Input, Sep31ErrorCode> {
  const anchorId = raw.anchorId.trim()
  const assetCode = raw.assetCode.trim()
  const context = raw.context.trim()
  const requirementsJson = raw.requirementsJson.trim()
  const fieldMapJson = raw.fieldMapJson.trim()

  if (!anchorId || !assetCode || !context || !requirementsJson || !fieldMapJson) return err("empty_input")
  if ([anchorId, assetCode, context, requirementsJson, fieldMapJson].some(containsSecretSeed)) return err("invalid_input")
  if (anchorId.startsWith("S") || anchorId.length > 128) return err("invalid_input")
  if (!ASSET_CODE.test(assetCode)) return err("invalid_input")
  if (context !== "sender" && context !== "receiver") return err("unsupported_variant")
  if (requirementsJson.length > MAX_JSON_LENGTH || fieldMapJson.length > MAX_JSON_LENGTH) return err("too_large")

  return ok({
    anchorId,
    assetCode,
    context: context as FieldContext,
    requirementsJson,
    fieldMapJson
  })
}
