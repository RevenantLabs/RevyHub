import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import {
  MAX_TYPE_DEPTH,
  extractWasmInterface,
  parseWasmSections,
  readU32Leb,
  renderSpecType
} from "@/features/contract-upgrade-diff-report/lib/wasm-interface-extract";
import { MAX_WASM_BYTES } from "@/features/contract-upgrade-diff-report/schema";
import { newWasm, oldWasm, types } from "@/features/contract-upgrade-diff-report/fixtures/normal.fixture";
import * as edge from "@/features/contract-upgrade-diff-report/fixtures/boundary.fixture";
import type { UpgradeSide, WasmInterface } from "@/features/contract-upgrade-diff-report/types";

function extract(bytes: Uint8Array, side: UpgradeSide = "old"): WasmInterface {
  const result = extractWasmInterface({ side, fileName: `${side}.wasm`, bytes });
  if (!result.ok) throw new Error(`expected a decoded interface, got ${result.code}`);
  return result.value;
}

describe("readU32Leb", () => {
  it("reads single and multi-byte values", () => {
    expect(readU32Leb(Uint8Array.from([0x02]), 0)).toEqual({ value: 2, next: 1 });
    expect(readU32Leb(Uint8Array.from([0xe5, 0x8e, 0x26]), 0)).toEqual({ value: 624485, next: 3 });
  });

  it("reads the largest u32 without going negative", () => {
    expect(readU32Leb(Uint8Array.from([0xff, 0xff, 0xff, 0xff, 0x0f]), 0)).toEqual({
      value: 4_294_967_295,
      next: 5
    });
  });

  it("rejects a fifth byte that sets bits past 32", () => {
    expect(readU32Leb(Uint8Array.from([0xff, 0xff, 0xff, 0xff, 0x10]), 0)).toBeNull();
  });

  it("rejects over-long and unterminated encodings", () => {
    expect(readU32Leb(Uint8Array.from([0x80, 0x80, 0x80, 0x80, 0x80, 0x00]), 0)).toBeNull();
    expect(readU32Leb(Uint8Array.from([0x80, 0x80]), 0)).toBeNull();
    expect(readU32Leb(Uint8Array.from([]), 0)).toBeNull();
  });
});

describe("parseWasmSections", () => {
  it("lists custom sections in file order and skips standard ones", () => {
    const parsed = parseWasmSections(oldWasm);
    expect(parsed.ok && parsed.value.map((section) => section.name)).toEqual([
      "contractenvmetav0",
      "contractmetav0",
      "contractspecv0"
    ]);
  });

  it("accepts a module with only a header", () => {
    expect(parseWasmSections(edge.headerOnlyWasm)).toEqual({ ok: true, value: [] });
  });

  it.each([
    ["non-Wasm bytes", edge.notWasmBytes],
    ["a truncated header", edge.shortHeaderWasm],
    ["an overflowing LEB128", edge.overflowingLebWasm],
    ["an unterminated LEB128", edge.unterminatedLebWasm],
    ["a section past the end", edge.sectionPastEndWasm],
    ["a name past its section", edge.namePastSectionWasm],
    ["a non-UTF-8 section name", edge.invalidUtf8NameWasm],
    ["a repeated standard section", edge.duplicateStandardSectionWasm],
    ["more than 1 MiB", edge.overMaxWasm]
  ])("rejects %s as malformed", (_label, bytes) => {
    expect(parseWasmSections(bytes)).toEqual({ ok: false, code: "malformed_data" });
  });

  it.each([
    ["a component-model binary", edge.componentModelWasm],
    ["an unknown section id", edge.unknownSectionIdWasm]
  ])("rejects %s as an unsupported variant", (_label, bytes) => {
    expect(parseWasmSections(bytes)).toEqual({ ok: false, code: "unsupported_variant" });
  });

  it("accepts a module of exactly 1 MiB", () => {
    expect(edge.exactlyMaxWasm.length).toBe(MAX_WASM_BYTES);
    expect(parseWasmSections(edge.exactlyMaxWasm).ok).toBe(true);
  });
});

describe("renderSpecType", () => {
  it("renders nested types losslessly", () => {
    const type = types.option(types.map(types.address(), types.vec(types.result(types.i128(), types.udt("Err")))));
    expect(renderSpecType(type)).toBe("Option<Map<Address, Vec<Result<i128, Err>>>>");
    expect(renderSpecType(types.bytesN(32))).toBe("BytesN<32>");
    expect(renderSpecType(types.void())).toBe("()");
  });

  it("renders tuples", () => {
    const tuple = xdr.ScSpecTypeDef.scSpecTypeTuple(
      new xdr.ScSpecTypeTuple({ valueTypes: [types.u32(), types.address()] })
    );
    expect(renderSpecType(tuple)).toBe("(u32, Address)");
  });

  it("refuses nesting past the supported depth", () => {
    let type = types.u32();
    for (let depth = 0; depth <= MAX_TYPE_DEPTH + 1; depth++) type = types.vec(type);
    expect(() => renderSpecType(type)).toThrow(RangeError);
  });
});

describe("extractWasmInterface", () => {
  it("hashes the full upload with SHA-256", () => {
    const expected = createHash("sha256").update(oldWasm).digest("hex");
    expect(extract(oldWasm).codeHash).toBe(expected);
    expect(extract(newWasm).codeHash).not.toBe(expected);
  });

  it("decodes specification, environment and publisher metadata", () => {
    const decoded = extract(oldWasm);
    expect(decoded.environment).toEqual({ protocol: 21, preRelease: 0 });
    expect(decoded.metadata).toEqual([
      { key: "rsver", value: "1.79.0" },
      { key: "rssdkver", value: "21.7.0" }
    ]);
    expect(decoded.declarations?.map((d) => `${d.kind}:${d.name}`)).toEqual([
      "function:init",
      "function:transfer",
      "function:balance",
      "function:legacy_mint",
      "type:Config",
      "type:Token",
      "error:TokenError"
    ]);
    expect(decoded.sections.contractspecv0).toMatchObject({ status: "present", sectionCount: 1, entryCount: 7 });
    expect(decoded.collisions).toEqual([]);
  });

  it("renders function signatures with positional arguments and excludes docs", () => {
    const transfer = extract(oldWasm).declarations?.find((d) => d.name === "transfer");
    expect(transfer?.signature).toBe("fn transfer(from: Address, to: Address, amount: i128) -> ()");
    expect(transfer?.parts[0]).toEqual({ label: "argument 1", value: "from: Address" });

    const oldInit = extract(oldWasm).declarations?.find((d) => d.name === "init");
    const newInit = extract(newWasm).declarations?.find((d) => d.name === "init");
    expect(oldInit?.signature).toBe(newInit?.signature);
  });

  describe("duplicate sections", () => {
    it("merges a byte-identical repeated spec section without a collision", () => {
      const decoded = extract(edge.duplicateIdenticalSpecWasm);
      expect(decoded.sections.contractspecv0).toMatchObject({ status: "present", sectionCount: 2, entryCount: 4 });
      expect(decoded.declarations).toHaveLength(2);
      expect(decoded.collisions).toEqual([]);
    });

    it("accepts repeated environment sections that agree", () => {
      const decoded = extract(edge.duplicateAgreeingEnvWasm);
      expect(decoded.sections.contractenvmetav0).toMatchObject({ status: "present", sectionCount: 2 });
      expect(decoded.environment).toEqual({ protocol: 22, preRelease: 0 });
    });

    it("trusts neither of two environment sections that disagree", () => {
      const decoded = extract(edge.duplicateConflictingEnvWasm);
      expect(decoded.sections.contractenvmetav0.status).toBe("conflicting");
      expect(decoded.environment).toBeNull();
    });
  });

  describe("malformed and unsupported XDR", () => {
    it.each([
      ["truncated", edge.truncatedSpecWasm],
      ["badly padded", edge.badPaddingSpecWasm]
    ])("marks a %s spec as malformed and asserts no declarations", (_label, bytes) => {
      const decoded = extract(bytes);
      expect(decoded.sections.contractspecv0.status).toBe("malformed_data");
      expect(decoded.declarations).toBeNull();
    });

    it("marks an unknown spec entry kind as an unsupported variant", () => {
      const decoded = extract(edge.unsupportedSpecKindWasm);
      expect(decoded.sections.contractspecv0.status).toBe("unsupported_variant");
      expect(decoded.declarations).toBeNull();
    });

    it("marks an environment section with no entry as malformed", () => {
      const decoded = extract(edge.emptyEnvWasm);
      expect(decoded.sections.contractenvmetav0.status).toBe("malformed_data");
      expect(decoded.environment).toBeNull();
    });

    it("refuses metadata that is not valid UTF-8", () => {
      const decoded = extract(edge.invalidUtf8MetaWasm);
      expect(decoded.sections.contractmetav0.status).toBe("malformed_data");
      expect(decoded.metadata).toBeNull();
    });
  });

  describe("absent versus empty", () => {
    it("labels a missing spec section as absent with no declarations", () => {
      const decoded = extract(edge.noSpecWasm);
      expect(decoded.sections.contractspecv0).toMatchObject({ status: "absent", sectionCount: 0 });
      expect(decoded.declarations).toBeNull();
      expect(decoded.metadata).toBeNull();
    });

    it("treats a present empty spec section as a valid empty interface", () => {
      const decoded = extract(edge.emptySpecWasm);
      expect(decoded.sections.contractspecv0).toMatchObject({ status: "present", entryCount: 0 });
      expect(decoded.declarations).toEqual([]);
    });
  });

  describe("source-name collisions", () => {
    it("reports two different functions sharing a name", () => {
      expect(extract(edge.functionCollisionWasm).collisions).toEqual([
        { scope: "function", name: "transfer", count: 2 }
      ]);
    });

    it("reports a struct and an error enum sharing a type name", () => {
      expect(extract(edge.udtCollisionWasm).collisions).toEqual([{ scope: "udt", name: "Error", count: 2 }]);
    });

    it("reports a repeated member inside one declaration", () => {
      expect(extract(edge.memberCollisionWasm).collisions).toEqual([
        { scope: "udt", name: "Error", count: 2, member: "case NotFound" }
      ]);
    });

    it("reports a metadata key declared twice with different values", () => {
      expect(extract(edge.metaCollisionWasm).collisions).toEqual([
        { scope: "metadata", name: "rsver", count: 2 }
      ]);
    });
  });

  it("propagates a framing failure", () => {
    expect(extractWasmInterface({ side: "new", fileName: "x.wasm", bytes: edge.componentModelWasm })).toEqual({
      ok: false,
      code: "unsupported_variant"
    });
  });
});
