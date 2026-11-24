import { declarationKey } from "@/features/contract-upgrade-diff-report/lib/wasm-interface-extract";
import type {
  ChangeImpact,
  ChangeStatus,
  Declaration,
  DeclarationChange,
  DeclarationKind,
  EnvironmentChange,
  MetadataChange,
  NameCollision,
  PartChange,
  WasmInterface
} from "@/features/contract-upgrade-diff-report/types";

const KIND_ORDER: Record<DeclarationKind, number> = { function: 0, type: 1, error: 2 };

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Conservative impact: anything removed or reshaped may break an existing
 * caller, anything only added cannot, and nothing is claimed without evidence.
 */
export function impactOf(status: ChangeStatus): ChangeImpact {
  if (status === "removed" || status === "changed") return "breaking";
  if (status === "added") return "additive";
  if (status === "unchanged") return "none";
  return "unknown";
}

/**
 * Compares two declarations part by part. Labels already encode position for
 * function arguments and names for fields and cases, so matching on the label
 * is the right identity for both.
 */
export function diffParts(before: Declaration | null, after: Declaration | null): PartChange[] {
  const oldParts = new Map((before?.parts ?? []).map((part) => [part.label, part.value]));
  const newParts = new Map((after?.parts ?? []).map((part) => [part.label, part.value]));
  const labels = [...oldParts.keys(), ...[...newParts.keys()].filter((label) => !oldParts.has(label))];

  return labels.map((label) => {
    const was = oldParts.get(label) ?? null;
    const now = newParts.get(label) ?? null;
    const status: PartChange["status"] =
      was === null ? "added" : now === null ? "removed" : was === now ? "unchanged" : "changed";
    return { label, before: was, after: now, status };
  });
}

function collisionKeys(collisions: NameCollision[]): Set<string> {
  return new Set(
    collisions
      .filter((collision) => collision.scope !== "metadata")
      .map((collision) => `${collision.scope}:${collision.name}`)
  );
}

function sortChanges(changes: DeclarationChange[]): DeclarationChange[] {
  return changes.sort(
    (a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || compareText(a.name, b.name)
  );
}

function unknownChange(
  before: Declaration | null,
  after: Declaration | null,
  reason: DeclarationChange["reason"]
): DeclarationChange {
  const reference = (after ?? before)!;
  return {
    kind: reference.kind,
    name: reference.name,
    status: "unknown",
    impact: "unknown",
    before,
    after,
    parts: [],
    reason
  };
}

/**
 * Classifies every declaration by its stable name.
 *
 * When either side's specification is unavailable, nothing is reported as
 * added or removed — a function missing from an unreadable spec is not a
 * removed function. Every declaration that *is* known is listed as `unknown`
 * instead, so the gap is visible rather than silently empty.
 */
export function diffDeclarations(old: WasmInterface, next: WasmInterface): DeclarationChange[] {
  const before = new Map((old.declarations ?? []).map((declaration) => [declarationKey(declaration), declaration]));
  const after = new Map((next.declarations ?? []).map((declaration) => [declarationKey(declaration), declaration]));
  const unavailable = old.declarations === null || next.declarations === null;
  const collided = new Set([...collisionKeys(old.collisions), ...collisionKeys(next.collisions)]);
  const keys = new Set([...before.keys(), ...after.keys()]);

  const changes: DeclarationChange[] = [];
  for (const key of keys) {
    const was = before.get(key) ?? null;
    const now = after.get(key) ?? null;

    if (unavailable) {
      changes.push(unknownChange(was, now, "spec_unavailable"));
      continue;
    }

    if (collided.has(key)) {
      changes.push(unknownChange(was, now, "name_collision"));
      continue;
    }

    let status: ChangeStatus;
    if (!was) status = "added";
    else if (!now) status = "removed";
    else status = was.kind === now.kind && was.signature === now.signature ? "unchanged" : "changed";

    const reference = (now ?? was)!;
    changes.push({
      kind: reference.kind,
      name: reference.name,
      status,
      impact: impactOf(status),
      before: was,
      after: now,
      parts: diffParts(was, now)
    });
  }

  return sortChanges(changes);
}

export function diffEnvironment(old: WasmInterface, next: WasmInterface): EnvironmentChange {
  const before = old.environment;
  const after = next.environment;
  if (!before || !after) return { before, after, status: "unknown", reason: "env_unavailable" };
  const same = before.protocol === after.protocol && before.preRelease === after.preRelease;
  return { before, after, status: same ? "unchanged" : "changed" };
}

/** Publisher metadata is compared by key; values are kept verbatim. */
export function diffMetadata(old: WasmInterface, next: WasmInterface): MetadataChange[] {
  const collided = new Set(
    [...old.collisions, ...next.collisions]
      .filter((collision) => collision.scope === "metadata")
      .map((collision) => collision.name)
  );
  const before = new Map((old.metadata ?? []).map((entry) => [entry.key, entry.value]));
  const after = new Map((next.metadata ?? []).map((entry) => [entry.key, entry.value]));
  const unavailable = old.metadata === null || next.metadata === null;
  const keys = [...new Set([...before.keys(), ...after.keys()])].sort(compareText);

  return keys.map((key) => {
    const was = before.get(key) ?? null;
    const now = after.get(key) ?? null;
    if (unavailable) return { key, before: was, after: now, status: "unknown", reason: "meta_unavailable" };
    if (collided.has(key)) return { key, before: was, after: now, status: "unknown", reason: "name_collision" };
    const status: ChangeStatus =
      was === null ? "added" : now === null ? "removed" : was === now ? "unchanged" : "changed";
    return { key, before: was, after: now, status };
  });
}
