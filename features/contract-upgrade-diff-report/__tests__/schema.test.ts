import { describe, expect, it } from "vitest";
import {
  MAX_WASM_BYTES,
  displayFileName,
  hasWasmMagic,
  looksLikeSecretSeed,
  parseWasmUpload,
  validateUpgradeFiles
} from "@/features/contract-upgrade-diff-report/schema";
import { newWasm, oldWasm, wasmFile } from "@/features/contract-upgrade-diff-report/fixtures/normal.fixture";
import {
  exactlyMaxWasm,
  notWasmBytes,
  overMaxWasm,
  secretSeed,
  secretSeedBytes
} from "@/features/contract-upgrade-diff-report/fixtures/boundary.fixture";

const oldFile = wasmFile(oldWasm, "old.wasm");
const newFile = wasmFile(newWasm, "new.wasm");

describe("validateUpgradeFiles", () => {
  it("accepts two non-empty files", () => {
    expect(validateUpgradeFiles({ oldFile, newFile })).toEqual({ ok: true, value: { oldFile, newFile } });
  });

  it("names the missing side, old first", () => {
    expect(validateUpgradeFiles({ oldFile: null, newFile: null })).toEqual({
      ok: false,
      code: "invalid_input",
      detail: { side: "old" }
    });
    expect(validateUpgradeFiles({ oldFile, newFile: null })).toEqual({
      ok: false,
      code: "invalid_input",
      detail: { side: "new" }
    });
  });

  it("rejects an empty file", () => {
    expect(validateUpgradeFiles({ oldFile: wasmFile(new Uint8Array(), "empty.wasm"), newFile })).toMatchObject({
      ok: false,
      code: "invalid_input"
    });
  });

  it("accepts exactly 1 MiB and rejects one byte more, before reading", () => {
    expect(validateUpgradeFiles({ oldFile: wasmFile(exactlyMaxWasm, "max.wasm"), newFile }).ok).toBe(true);
    expect(validateUpgradeFiles({ oldFile, newFile: wasmFile(overMaxWasm, "big.wasm") })).toEqual({
      ok: false,
      code: "too_large",
      detail: { side: "new" }
    });
  });
});

describe("parseWasmUpload", () => {
  it("re-checks the bound on the bytes actually read", () => {
    expect(parseWasmUpload(overMaxWasm, "big.wasm", "old")).toEqual({
      ok: false,
      code: "too_large",
      detail: { side: "old" }
    });
    expect(parseWasmUpload(exactlyMaxWasm, "max.wasm", "old").ok).toBe(true);
    expect(overMaxWasm.length).toBe(MAX_WASM_BYTES + 1);
  });

  it("rejects empty bytes", () => {
    expect(parseWasmUpload(new Uint8Array(), "x.wasm", "new")).toMatchObject({ ok: false, code: "invalid_input" });
  });

  it("refuses a file holding a secret seed and does not keep its bytes", () => {
    const result = parseWasmUpload(secretSeedBytes, "notes.txt", "old");
    expect(result).toEqual({ ok: false, code: "invalid_input", detail: { side: "old" } });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("lets non-Wasm bytes through to the decoder, which reports them", () => {
    expect(parseWasmUpload(notWasmBytes, "archive.zip", "old").ok).toBe(true);
  });
});

describe("displayFileName", () => {
  it("never echoes a name shaped like a secret seed", () => {
    expect(displayFileName(`${secretSeed}.wasm`, "old")).toBe("old.wasm");
    expect(displayFileName(secretSeed, "new")).toBe("new.wasm");
  });

  it("drops control characters and bounds the length", () => {
    expect(displayFileName("to\u0000ken\n.wasm", "old")).toBe("token.wasm");
    expect(displayFileName(`${"a".repeat(200)}.wasm`, "old")).toBe(`${"a".repeat(120)}…`);
    expect(displayFileName("   ", "new")).toBe("new.wasm");
  });

  it("keeps markup-like names as plain text", () => {
    expect(displayFileName("<img src=x onerror=alert(1)>.wasm", "old")).toBe("<img src=x onerror=alert(1)>.wasm");
  });
});

describe("looksLikeSecretSeed and hasWasmMagic", () => {
  it("detects a seed only when it is the whole text", () => {
    expect(looksLikeSecretSeed(secretSeedBytes)).toBe(true);
    expect(looksLikeSecretSeed(new TextEncoder().encode(`seed: ${secretSeed}`))).toBe(false);
    expect(looksLikeSecretSeed(oldWasm)).toBe(false);
  });

  it("checks the Wasm magic number", () => {
    expect(hasWasmMagic(oldWasm)).toBe(true);
    expect(hasWasmMagic(notWasmBytes)).toBe(false);
    expect(hasWasmMagic(Uint8Array.from([0x00, 0x61]))).toBe(false);
  });
});
