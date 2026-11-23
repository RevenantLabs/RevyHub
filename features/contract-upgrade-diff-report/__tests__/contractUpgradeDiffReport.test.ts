import { describe, expect, it } from "vitest";
import {
  buildUpgradeReport,
  countStatuses
} from "@/features/contract-upgrade-diff-report/lib/contractUpgradeDiffReport";
import {
  classifyDecodeFailure,
  isInputProblem,
  readUploadBytes,
  UnsupportedVariantError
} from "@/features/contract-upgrade-diff-report/lib/contractUpgradeDiffReport.errors";
import { newWasm, oldWasm, wasmFile } from "@/features/contract-upgrade-diff-report/fixtures/normal.fixture";
import * as edge from "@/features/contract-upgrade-diff-report/fixtures/boundary.fixture";
import type { UpgradeInput } from "@/features/contract-upgrade-diff-report/types";

function input(oldBytes: Uint8Array, newBytes: Uint8Array): UpgradeInput {
  return {
    old: { side: "old", fileName: "old.wasm", bytes: oldBytes },
    new: { side: "new", fileName: "new.wasm", bytes: newBytes }
  };
}

function report(oldBytes: Uint8Array, newBytes: Uint8Array) {
  const result = buildUpgradeReport(input(oldBytes, newBytes));
  if (!result.ok) throw new Error(result.code);
  return result.value;
}

describe("buildUpgradeReport", () => {
  it("summarises the normal upgrade with complete evidence", () => {
    const value = report(oldWasm, newWasm);
    expect(value.codeIdentical).toBe(false);
    expect(value.counts).toEqual({ added: 1, removed: 1, changed: 3, unchanged: 3, unknown: 0 });
    expect(value.environment.status).toBe("changed");
    expect(value.interfaceComplete).toBe(true);
    expect(value.gaps).toEqual([]);
    expect(value.duplicateSections).toEqual([]);
  });

  it("recognises byte-identical binaries", () => {
    const value = report(oldWasm, Uint8Array.from(oldWasm));
    expect(value.codeIdentical).toBe(true);
    expect(value.counts.unchanged).toBe(value.declarations.length);
  });

  it("names the side of a framing failure", () => {
    expect(buildUpgradeReport(input(edge.notWasmBytes, newWasm))).toEqual({
      ok: false,
      code: "malformed_data",
      detail: { side: "old" }
    });
    expect(buildUpgradeReport(input(oldWasm, edge.componentModelWasm))).toEqual({
      ok: false,
      code: "unsupported_variant",
      detail: { side: "new" }
    });
  });

  it("reports incomplete evidence for a missing specification", () => {
    const value = report(edge.noSpecWasm, edge.baselineWasm);
    expect(value.interfaceComplete).toBe(false);
    expect(value.counts).toEqual({ added: 0, removed: 0, changed: 0, unchanged: 0, unknown: 2 });
    expect(value.gaps).toEqual([
      { type: "section", side: "old", section: "contractspecv0", status: "absent" },
      { type: "section", side: "old", section: "contractmetav0", status: "absent" }
    ]);
  });

  it("reports incomplete evidence for malformed and unsupported specifications", () => {
    const malformed = report(edge.baselineWasm, edge.truncatedSpecWasm);
    expect(malformed.interfaceComplete).toBe(false);
    expect(malformed.gaps).toContainEqual({
      type: "section",
      side: "new",
      section: "contractspecv0",
      status: "malformed_data"
    });

    const unsupported = report(edge.unsupportedSpecKindWasm, edge.baselineWasm);
    expect(unsupported.gaps).toContainEqual({
      type: "section",
      side: "old",
      section: "contractspecv0",
      status: "unsupported_variant"
    });
  });

  it("reports a collision as a gap and as incomplete evidence", () => {
    const value = report(edge.baselineWasm, edge.functionCollisionWasm);
    expect(value.interfaceComplete).toBe(false);
    expect(value.gaps).toContainEqual({ type: "collision", side: "new", scope: "function", name: "transfer", count: 2 });
  });

  it("keeps a metadata-only collision out of interface completeness", () => {
    const value = report(edge.baselineWasm, edge.metaCollisionWasm);
    expect(value.interfaceComplete).toBe(true);
    expect(value.gaps).toEqual([{ type: "collision", side: "new", scope: "metadata", name: "rsver", count: 2 }]);
  });

  it("lists duplicate sections and a conflicting environment", () => {
    const value = report(edge.duplicateIdenticalSpecWasm, edge.duplicateConflictingEnvWasm);
    expect(value.duplicateSections).toEqual([
      { side: "old", section: "contractspecv0", count: 2 },
      { side: "new", section: "contractenvmetav0", count: 2 }
    ]);
    expect(value.environment.status).toBe("unknown");
    expect(value.gaps).toContainEqual({
      type: "section",
      side: "new",
      section: "contractenvmetav0",
      status: "conflicting"
    });
  });

  it("accepts inputs of exactly 1 MiB", () => {
    const value = report(edge.exactlyMaxWasm, edge.baselineWasm);
    expect(value.old.byteLength).toBe(1_048_576);
    expect(value.counts.unchanged).toBe(2);
  });
});

describe("countStatuses", () => {
  it("counts every status, including zeros", () => {
    expect(countStatuses([{ status: "added" }, { status: "added" }, { status: "unknown" }])).toEqual({
      added: 2,
      removed: 0,
      changed: 0,
      unchanged: 0,
      unknown: 1
    });
  });
});

describe("error mapping", () => {
  it("classifies an unknown discriminant as unsupported and everything else as malformed", () => {
    expect(classifyDecodeFailure(new TypeError("XDR Read Error: unknown ScSpecEntryKind member for value 5"))).toBe(
      "unsupported_variant"
    );
    expect(classifyDecodeFailure(new UnsupportedVariantError("spec type x"))).toBe("unsupported_variant");
    expect(classifyDecodeFailure(new TypeError("XDR Read Error: attempt to read outside the boundary"))).toBe(
      "malformed_data"
    );
    expect(classifyDecodeFailure(new RangeError("Maximum call stack size exceeded"))).toBe("malformed_data");
    expect(classifyDecodeFailure("not an error")).toBe("malformed_data");
  });

  it("reads uploaded bytes and maps a read failure to read_failed", async () => {
    const read = await readUploadBytes(wasmFile(oldWasm, "old.wasm"), "old");
    expect(read.ok && Array.from(read.value)).toEqual(Array.from(oldWasm));

    const broken = wasmFile(oldWasm, "old.wasm");
    Object.defineProperty(broken, "arrayBuffer", { value: () => Promise.reject(new Error("denied")) });
    expect(await readUploadBytes(broken, "new")).toEqual({ ok: false, code: "read_failed", detail: { side: "new" } });
  });

  it("separates input problems from content problems", () => {
    expect(isInputProblem("too_large")).toBe(true);
    expect(isInputProblem("invalid_input")).toBe(true);
    expect(isInputProblem("malformed_data")).toBe(false);
    expect(isInputProblem("unsupported_variant")).toBe(false);
  });
});
