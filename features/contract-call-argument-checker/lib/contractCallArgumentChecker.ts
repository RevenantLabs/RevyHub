import { err, ok, type Result } from "@/core/result/result";
import type { ArgumentReport, ErrorCode } from "../types";
import { matchArguments } from "./argument-matcher";
import { parseArgumentXdr, describeScVal } from "./scval-shape";
import { formatType, parseSpec } from "./spec-parser";

export interface CheckerInput {
  spec: string;
  functionName: string;
  argumentsXdr: string;
}

export function checkArguments(input: CheckerInput): Result<ArgumentReport, ErrorCode> {
  const spec = parseSpec(input.spec);
  if (!spec.ok) return spec;
  const args = parseArgumentXdr(input.argumentsXdr);
  if (!args.ok) return args;
  const fn = spec.value.functions.find((item) => item.name === input.functionName);
  if (!fn) return err("unknown_function");
  const matched = matchArguments(spec.value, input.functionName, args.value);
  if (!matched.ok) return matched;
  return ok({
    functionNames: spec.value.functions.map((item) => item.name),
    selected: fn.name,
    expected: fn.inputs.map((item) => `${item.name}: ${formatType(item.type)}`),
    actual: args.value.map((value) => describeScVal(value)),
    mismatches: matched.value
  });
}
