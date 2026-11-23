import { describe, expect, it } from "vitest";
import {
  diffDeclarations,
  diffEnvironment,
  diffMetadata,
  diffParts,
  impactOf
} from "@/features/contract-upgrade-diff-report/lib/interface-compatibility-diff";
import { extractWasmInterface } from "@/features/contract-upgrade-diff-report/lib/wasm-interface-extract";
import {
  customSection,
  envMeta,
  expectedStatuses,
  fn,
  newWasm,
  oldWasm,
  types,
  wasmModule
} from "@/features/contract-upgrade-diff-report/fixtures/normal.fixture";
import * as edge from "@/features/contract-upgrade-diff-report/fixtures/boundary.fixture";
import type { DeclarationChange, UpgradeSide, WasmInterface } from "@/features/contract-upgrade-diff-report/types";

function extract(bytes: Uint8Array, side: UpgradeSide): WasmInterface {
  const result = extractWasmInterface({ side, fileName: `${side}.wasm`, bytes });
  if (!result.ok) throw new Error(result.code);
  return result.value;
}

const oldSide = extract(oldWasm, "old");
const newSide = extract(newWasm, "new");

function byKey(changes: DeclarationChange[]) {
  return Object.fromEntries(changes.map((change) => [`${change.kind}:${change.name}`, change]));
}

describe("diffDeclarations", () => {
  it("classifies every declaration of the normal upgrade by stable name, and nothing else", () => {
    const changes = diffDeclarations(oldSide, newSide);
    expect(Object.fromEntries(changes.map((c) => [`${c.kind}:${c.name}`, c.status]))).toEqual(expectedStatuses);
  });

  it("orders functions, then types, then errors, each alphabetically", () => {
    expect(diffDeclarations(oldSide, newSide).map((c) => c.name)).toEqual([
      "balance",
      "burn",
      "init",
      "legacy_mint",
      "transfer",
      "Config",
      "Token",
      "TokenError"
    ]);
  });

  it("pinpoints a changed return type", () => {
    const transfer = byKey(diffDeclarations(oldSide, newSide))["function:transfer"]!;
    expect(transfer.impact).toBe("breaking");
    expect(transfer.parts.filter((part) => part.status !== "unchanged")).toEqual([
      { label: "returns", before: "()", after: "Result<(), TokenError>", status: "changed" }
    ]);
  });

  it("pinpoints a widened struct field and an added error case", () => {
    const changes = byKey(diffDeclarations(oldSide, newSide));
    expect(changes["type:Config"]!.parts.filter((part) => part.status !== "unchanged")).toEqual([
      { label: "field fee_bps", before: "u32", after: "u64", status: "changed" }
    ]);
    expect(changes["error:TokenError"]!.parts.filter((part) => part.status !== "unchanged")).toEqual([
      { label: "case Paused", before: null, after: "3", status: "added" }
    ]);
  });

  it("does not treat a reordered named-field struct as changed", () => {
    expect(byKey(diffDeclarations(oldSide, newSide))["type:Token"]!.status).toBe("unchanged");
  });

  it("treats a renamed or added argument as a positional change", () => {
    const before = extract(wasmModule(customSection("contractspecv0", fn("pay", [["to", types.address()]]))), "old");
    const after = extract(
      wasmModule(
        customSection(
          "contractspecv0",
          fn("pay", [
            ["recipient", types.address()],
            ["amount", types.i128()]
          ])
        )
      ),
      "new"
    );
    const [pay] = diffDeclarations(before, after);
    expect(pay!.status).toBe("changed");
    expect(pay!.parts).toEqual([
      { label: "argument 1", before: "to: Address", after: "recipient: Address", status: "changed" },
      { label: "returns", before: "()", after: "()", status: "unchanged" },
      { label: "argument 2", before: null, after: "amount: i128", status: "added" }
    ]);
  });

  it("labels everything unknown, never added or removed, when one spec is absent", () => {
    const changes = diffDeclarations(extract(edge.noSpecWasm, "old"), extract(edge.baselineWasm, "new"));
    expect(changes.map((c) => [c.name, c.status, c.reason, c.impact])).toEqual([
      ["transfer", "unknown", "spec_unavailable", "unknown"],
      ["Error", "unknown", "spec_unavailable", "unknown"]
    ]);
  });

  it("labels everything unknown when one spec is malformed", () => {
    const changes = diffDeclarations(extract(edge.baselineWasm, "old"), extract(edge.truncatedSpecWasm, "new"));
    expect(changes.every((c) => c.status === "unknown" && c.after === null)).toBe(true);
    expect(changes).toHaveLength(2);
  });

  it("compares two present empty specs as a valid empty result", () => {
    expect(diffDeclarations(extract(edge.emptySpecWasm, "old"), extract(edge.emptySpecWasm, "new"))).toEqual([]);
  });

  it("reports every declaration as added against a present empty spec", () => {
    const changes = diffDeclarations(extract(edge.emptySpecWasm, "old"), extract(edge.baselineWasm, "new"));
    expect(changes.map((c) => c.status)).toEqual(["added", "added"]);
  });

  it("marks a colliding name unknown while still comparing the others", () => {
    const changes = byKey(
      diffDeclarations(extract(edge.baselineWasm, "old"), extract(edge.functionCollisionWasm, "new"))
    );
    expect(changes["function:transfer"]).toMatchObject({ status: "unknown", reason: "name_collision" });
    expect(changes["error:Error"]!.status).toBe("unchanged");
  });

  it("marks a declaration with a repeated member unknown", () => {
    const changes = byKey(
      diffDeclarations(extract(edge.baselineWasm, "old"), extract(edge.memberCollisionWasm, "new"))
    );
    expect(changes["error:Error"]).toMatchObject({ status: "unknown", reason: "name_collision" });
    expect(changes["function:transfer"]!.status).toBe("unchanged");
  });
});

describe("diffParts", () => {
  it("lists removed parts", () => {
    expect(
      diffParts(
        { kind: "error", name: "E", signature: "a", parts: [{ label: "case A", value: "1" }] },
        { kind: "error", name: "E", signature: "b", parts: [] }
      )
    ).toEqual([{ label: "case A", before: "1", after: null, status: "removed" }]);
  });
});

describe("impactOf", () => {
  it("is conservative", () => {
    expect(impactOf("removed")).toBe("breaking");
    expect(impactOf("changed")).toBe("breaking");
    expect(impactOf("added")).toBe("additive");
    expect(impactOf("unchanged")).toBe("none");
    expect(impactOf("unknown")).toBe("unknown");
  });
});

describe("diffEnvironment", () => {
  it("reports a changed environment protocol", () => {
    expect(diffEnvironment(oldSide, newSide)).toEqual({
      before: { protocol: 21, preRelease: 0 },
      after: { protocol: 22, preRelease: 0 },
      status: "changed"
    });
  });

  it("reports a changed pre-release number on the same protocol", () => {
    const base = extract(wasmModule(customSection("contractenvmetav0", envMeta(22))), "old");
    expect(diffEnvironment(base, extract(edge.preReleaseEnvWasm, "new")).status).toBe("changed");
  });

  it("reports unchanged when both agree", () => {
    expect(diffEnvironment(oldSide, extract(oldWasm, "new")).status).toBe("unchanged");
  });

  it("refuses to compare a conflicting environment", () => {
    expect(diffEnvironment(oldSide, extract(edge.duplicateConflictingEnvWasm, "new"))).toEqual({
      before: { protocol: 21, preRelease: 0 },
      after: null,
      status: "unknown",
      reason: "env_unavailable"
    });
  });
});

describe("diffMetadata", () => {
  it("compares publisher metadata by key with verbatim values", () => {
    expect(diffMetadata(oldSide, newSide)).toEqual([
      { key: "rssdkver", before: "21.7.0", after: "22.0.0", status: "changed" },
      { key: "rsver", before: "1.79.0", after: "1.81.0", status: "changed" },
      { key: "source_repo", before: null, after: "https://example.invalid/token", status: "added" }
    ]);
  });

  it("labels keys unknown when one side has no metadata", () => {
    expect(diffMetadata(oldSide, extract(edge.noSpecWasm, "new"))).toEqual([
      { key: "rssdkver", before: "21.7.0", after: null, status: "unknown", reason: "meta_unavailable" },
      { key: "rsver", before: "1.79.0", after: null, status: "unknown", reason: "meta_unavailable" }
    ]);
  });

  it("labels a colliding key unknown", () => {
    expect(diffMetadata(extract(edge.baselineWasm, "old"), extract(edge.metaCollisionWasm, "new"))).toEqual([
      { key: "rsver", before: "1.79.0", after: "1.79.0", status: "unknown", reason: "name_collision" }
    ]);
  });
});
