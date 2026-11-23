import { err, ok, type Result } from "@/core/result/result"
import { loadSideEvidence, type EvidenceDeps } from "@/features/cross-network-asset-parity-report/lib/asset-pair-evidence"
import { diffSideEvidence } from "@/features/cross-network-asset-parity-report/lib/metadata-parity-diff"
import type { ParityErrorCode, ParityInput, ParityResult, SideEvidence } from "@/features/cross-network-asset-parity-report/types"

export async function runCrossNetworkAssetParityReport(
  input: ParityInput,
  deps: EvidenceDeps = {},
  signal?: AbortSignal
): Promise<Result<ParityResult, ParityErrorCode>> {
  const loaded: SideEvidence[] = []
  for (const pair of input.pairs) {
    loaded.push(await loadSideEvidence(pair.left, deps, signal))
    loaded.push(await loadSideEvidence(pair.right, deps, signal))
  }

  if (loaded.every((side) => side.failure === "rate_limited")) return err("rate_limited")
  if (loaded.every((side) => side.failure === "request_failed")) return err("request_failed")

  const retrievedAt = loaded[0]?.retrievedAt ?? (deps.now ?? (() => new Date().toISOString()))()
  const pairs = input.pairs.map((pair, index) => {
    const left = loaded[index * 2] as SideEvidence
    const right = loaded[index * 2 + 1] as SideEvidence
    const partial = left.status !== "found" || right.status !== "found" || left.assetType === null || right.assetType === null
    return {
      id: pair.id,
      left,
      right,
      diffs: diffSideEvidence(left, right),
      partial
    }
  })

  return ok({
    pairs,
    partial: pairs.some((pair) => pair.partial),
    retrievedAt,
    provider: "horizon"
  })
}
