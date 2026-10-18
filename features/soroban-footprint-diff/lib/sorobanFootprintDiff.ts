import { ok, type Result } from "@/core/result/result";
import { copy } from "@/features/soroban-footprint-diff/copy";
import { diffAccessModes } from "@/features/soroban-footprint-diff/lib/access-diff";
import { parseSimulationFootprint } from "@/features/soroban-footprint-diff/lib/footprint-parser";
import type {
  SorobanFootprintDiffErrorCode,
  SorobanFootprintDiffInput,
  SorobanFootprintDiffResult
} from "@/features/soroban-footprint-diff/types";

export async function runSorobanFootprintDiff(
  input: SorobanFootprintDiffInput
): Promise<Result<SorobanFootprintDiffResult, SorobanFootprintDiffErrorCode>> {
  const first = parseSimulationFootprint(input.firstResult);
  if (!first.ok) return first;
  const second = parseSimulationFootprint(input.secondResult);
  if (!second.ok) return second;

  const diff = diffAccessModes(first.value.keys, second.value.keys);

  return ok({
    added: diff.added,
    removed: diff.removed,
    modeChanges: diff.modeChanges,
    unchanged: diff.unchanged,
    firstResources: first.value.resources,
    secondResources: second.value.resources,
    disclaimer: copy.disclaimer
  });
}
