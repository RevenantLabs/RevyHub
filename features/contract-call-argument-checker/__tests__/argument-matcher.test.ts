import { expect, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import { matchArguments } from "../lib/argument-matcher";
import { parseSpec } from "../lib/spec-parser";
import { parseArgumentXdr } from "../lib/scval-shape";
import { amountArg, specText, unsupportedFn } from "../fixtures/contract-spec.fixture";
import { nestedArgs, nestedSpec } from "../fixtures/nested-arguments.fixture";

it("accepts a matching u32 and reports a nested struct mismatch", () => {
  const spec = parseSpec(specText);
  const args = parseArgumentXdr(amountArg);
  if (!spec.ok || !args.ok) throw new Error("fixture");
  const matched = matchArguments(spec.value, "transfer", args.value);
  expect(matched.ok && matched.value).toEqual([]);

  const nestedModel = parseSpec(nestedSpec);
  const nested = parseArgumentXdr(nestedArgs);
  if (!nestedModel.ok || !nested.ok) throw new Error("fixture");
  const mismatches = matchArguments(nestedModel.value, "set_owner", nested.value);
  expect(mismatches.ok && mismatches.value[0]).toMatchObject({ path: "argument 2 > field owner", expected: "address", actual: "u32" });
});

it("reports count, unknown function and unsupported result types", () => {
  const spec = parseSpec(specText);
  if (!spec.ok) throw new Error("fixture");
  const count = matchArguments(spec.value, "transfer", [xdr.ScVal.scvU32(1), xdr.ScVal.scvU32(2)]);
  expect(!count.ok && count.code).toBe("argument_count_mismatch");
  const missing = matchArguments(spec.value, "nope", []);
  expect(!missing.ok && missing.code).toBe("unknown_function");
  const unsupported = parseSpec(unsupportedFn);
  if (!unsupported.ok) throw new Error("fixture");
  const blocked = matchArguments(unsupported.value, "explode", [xdr.ScVal.scvVoid()]);
  expect(!blocked.ok && blocked.code).toBe("unsupported_spec_type");
});
