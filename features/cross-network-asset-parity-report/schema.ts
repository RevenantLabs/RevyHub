import { StrKey } from "@stellar/stellar-sdk"
import { err, ok, type Result } from "@/core/result/result"
import { isStellarNetwork } from "@/core/network/types"
import type {
  AssetSideInput,
  PairInput,
  ParityErrorCode,
  ParityInput
} from "@/features/cross-network-asset-parity-report/types"

export const MAX_PAIRS = 10
export const MAX_JSON_LENGTH = 20_000

const SECRET_SEED = /^S[A-Z2-7]{55}$/
const ASSET_CODE = /^[A-Za-z0-9]{1,12}$/

export interface RawParityInput {
  pairsJson: string
}

function containsSecretSeed(value: string): boolean {
  return value.split(/\s+/).some((token) => SECRET_SEED.test(token))
}

function readSide(value: unknown): AssetSideInput | null {
  if (typeof value !== "object" || value === null) return null
  const side = value as Record<string, unknown>
  if (!isStellarNetwork(side.network)) return null
  if (typeof side.code !== "string" || !ASSET_CODE.test(side.code)) return null
  if (typeof side.issuer !== "string" || !StrKey.isValidEd25519PublicKey(side.issuer)) return null
  if (side.code.toUpperCase() === "XLM" || side.code.toLowerCase() === "native") return null
  return { network: side.network, code: side.code, issuer: side.issuer }
}

function sideKey(side: AssetSideInput): string {
  return `${side.network}:${side.code}:${side.issuer}`
}

export function parseParityInput(raw: RawParityInput): Result<ParityInput, ParityErrorCode> {
  const pairsJson = raw.pairsJson.trim()
  if (!pairsJson) return err("empty_input")
  if (containsSecretSeed(pairsJson)) return err("invalid_input")
  if (pairsJson.length > MAX_JSON_LENGTH) return err("too_large")

  let parsed: unknown
  try {
    parsed = JSON.parse(pairsJson)
  } catch {
    return err("malformed_data")
  }
  if (!Array.isArray(parsed)) return err("malformed_data")
  if (parsed.length === 0) return err("empty_input")
  if (parsed.length > MAX_PAIRS) return err("too_large")

  const pairs: PairInput[] = []
  const ids = new Set<string>()
  const definitions = new Set<string>()

  for (const item of parsed) {
    if (typeof item !== "object" || item === null) return err("malformed_data")
    const record = item as Record<string, unknown>
    if (typeof record.id !== "string" || record.id.trim().length === 0 || record.id.length > 64) {
      return err("invalid_input")
    }
    const left = readSide(record.left)
    const right = readSide(record.right)
    if (!left || !right) {
      const code = sideCode(record.left) ?? sideCode(record.right)
      if (code && (code.toUpperCase() === "XLM" || code.toLowerCase() === "native")) return err("unsupported_variant")
      return err("invalid_input")
    }
    const id = record.id.trim()
    const definition = `${sideKey(left)}=>${sideKey(right)}`
    if (ids.has(id) || definitions.has(definition)) return err("invalid_input")
    ids.add(id)
    definitions.add(definition)
    pairs.push({ id, left, right })
  }

  return ok({ pairs })
}

function sideCode(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return null
  const code = (value as { code?: unknown }).code
  return typeof code === "string" ? code : null
}
