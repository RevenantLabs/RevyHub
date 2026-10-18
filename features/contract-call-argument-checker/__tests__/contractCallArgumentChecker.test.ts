import { expect, it } from "vitest";
import { checkArguments } from "../lib/contractCallArgumentChecker";
import { sample } from "../fixtures/contractCallArgumentChecker.fixture";
import { nestedSample } from "../fixtures/nested-arguments.fixture";
import { unsupportedFn } from "../fixtures/contract-spec.fixture";

it("accepts transfer and explains the nested owner mismatch", () => {
  const okResult = checkArguments({ spec: sample.spec, functionName: sample.functionName, argumentsXdr: sample.arguments });
  expect(okResult.ok && okResult.value.mismatches).toEqual([]);
  const nested = checkArguments({ spec: nestedSample.spec, functionName: nestedSample.functionName, argumentsXdr: nestedSample.arguments });
  expect(nested.ok && nested.value.mismatches[0]?.path).toBe("argument 2 > field owner");
});

it("returns the remaining error codes", () => {
  expect(!checkArguments({ spec: "nope", functionName: "transfer", argumentsXdr: sample.arguments }).ok).toBe(true);
  const unknown = checkArguments({ spec: sample.spec, functionName: "missing", argumentsXdr: sample.arguments });
  expect(!unknown.ok && unknown.code).toBe("unknown_function");
  const count = checkArguments({ spec: sample.spec, functionName: "transfer", argumentsXdr: `${sample.arguments}\n${sample.arguments}` });
  expect(!count.ok && count.code).toBe("argument_count_mismatch");
  const unsupported = checkArguments({ spec: unsupportedFn, functionName: "explode", argumentsXdr: sample.arguments });
  expect(!unsupported.ok && unsupported.code).toBe("unsupported_spec_type");
  const huge = checkArguments({ spec: "A".repeat(80_001), functionName: "transfer", argumentsXdr: "" });
  expect(!huge.ok && huge.code).toBe("too_large");
  const badArg = checkArguments({ spec: sample.spec, functionName: "transfer", argumentsXdr: "!!!!" });
  expect(!badArg.ok && badArg.code).toBe("invalid_arg_xdr");
});
