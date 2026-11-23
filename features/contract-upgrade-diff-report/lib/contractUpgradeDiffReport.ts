import { err, ok, type Result } from "@/core/result/result";
import { extractWasmInterface } from "@/features/contract-upgrade-diff-report/lib/wasm-interface-extract";
import {
  diffDeclarations,
  diffEnvironment,
  diffMetadata
} from "@/features/contract-upgrade-diff-report/lib/interface-compatibility-diff";
import {
  METADATA_SECTIONS,
  type ChangeStatus,
  type DeclarationChange,
  type EvidenceGap,
  type UpgradeErrorCode,
  type UpgradeErrorDetail,
  type UpgradeInput,
  type UpgradeReport,
  type WasmInterface
} from "@/features/contract-upgrade-diff-report/types";

export function countStatuses(changes: Pick<DeclarationChange, "status">[]): Record<ChangeStatus, number> {
  const counts: Record<ChangeStatus, number> = { added: 0, removed: 0, changed: 0, unchanged: 0, unknown: 0 };
  for (const change of changes) counts[change.status] += 1;
  return counts;
}

/** Lists every section that could not be trusted and every name that collided, per side. */
export function collectGaps(sides: WasmInterface[]): EvidenceGap[] {
  const gaps: EvidenceGap[] = [];
  for (const side of sides) {
    for (const section of METADATA_SECTIONS) {
      const { status } = side.sections[section];
      if (status !== "present") gaps.push({ type: "section", side: side.side, section, status });
    }
    for (const collision of side.collisions) gaps.push({ type: "collision", side: side.side, ...collision });
  }
  return gaps;
}

/**
 * Builds the full upgrade report for two uploads.
 *
 * Synchronous and local: both binaries are only parsed, never compiled or
 * run. A framing failure on either side stops the report and names the side;
 * a section-level gap is carried into the report and makes the affected
 * comparisons `unknown` instead.
 */
export function buildUpgradeReport(
  input: UpgradeInput
): Result<UpgradeReport, UpgradeErrorCode, UpgradeErrorDetail> {
  const old = extractWasmInterface(input.old);
  if (!old.ok) return err(old.code, { side: "old" });

  const next = extractWasmInterface(input.new);
  if (!next.ok) return err(next.code, { side: "new" });

  const declarations = diffDeclarations(old.value, next.value);
  const sides = [old.value, next.value];

  const interfaceComplete =
    sides.every((side) => side.declarations !== null) &&
    sides.every((side) => side.collisions.every((collision) => collision.scope === "metadata"));

  return ok({
    old: old.value,
    new: next.value,
    codeIdentical: old.value.codeHash === next.value.codeHash,
    declarations,
    environment: diffEnvironment(old.value, next.value),
    metadata: diffMetadata(old.value, next.value),
    counts: countStatuses(declarations),
    gaps: collectGaps(sides),
    duplicateSections: sides.flatMap((side) =>
      METADATA_SECTIONS.filter((section) => side.sections[section].sectionCount > 1).map((section) => ({
        side: side.side,
        section,
        count: side.sections[section].sectionCount
      }))
    ),
    interfaceComplete
  });
}
