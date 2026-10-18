import { expect, it } from "vitest";
import { parseSpec, formatType } from "../lib/spec-parser";
import { MAX_XDR_CHARS } from "../lib/spec-parser";
import { specText, transferFn, unsupportedFn } from "../fixtures/contract-spec.fixture";

it("lists functions and formats a u32 input", () => {
  const parsed = parseSpec(specText);
  expect(parsed.ok).toBe(true);
  if (!parsed.ok) return;
  expect(parsed.value.functions.map((fn) => fn.name)).toEqual(["transfer", "set_owner"]);
  expect(formatType(parsed.value.functions[0]?.inputs[0]?.type ?? { kind: "void" })).toBe("u32");
});

it("rejects malformed XDR, empty input and oversized text", () => {
  expect(parseSpec("not xdr").ok).toBe(false);
  expect(parseSpec("").ok).toBe(false);
  expect(parseSpec(`${transferFn}\n${"A".repeat(MAX_XDR_CHARS)}`).ok).toBe(false);
  const unsupported = parseSpec(unsupportedFn);
  expect(unsupported.ok && unsupported.value.functions[0]?.inputs[0]?.type.kind).toBe("result");
});
