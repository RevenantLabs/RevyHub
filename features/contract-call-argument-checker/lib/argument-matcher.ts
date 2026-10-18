import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, Mismatch, SpecFunction, SpecModel, TypeNode } from "../types";
import { formatType } from "./spec-parser";
import { describeScVal } from "./scval-shape";

function structOf(model: SpecModel, name: string | undefined) {
  return model.structs.find((struct) => struct.name === name);
}

function matches(type: TypeNode, value: xdr.ScVal, path: string, model: SpecModel): Result<Mismatch[], ErrorCode> {
  if (type.kind === "result" || type.kind === "unsupported") return err("unsupported_spec_type");
  if (type.kind === "option") {
    if (value.switch().name === "scvVoid") return ok([]);
    return matches(type.items?.[0] ?? { kind: "void" }, value, path, model);
  }
  if (type.kind === "struct") {
    const struct = structOf(model, type.name);
    if (!struct) return err("unsupported_spec_type");
    if (value.switch().name !== "scvMap") {
      return ok([{ path, expected: formatType(type), actual: describeScVal(value) }]);
    }
    const mismatches: Mismatch[] = [];
    for (const field of struct.fields) {
      const entry = (value.map() ?? []).find((item) => item.key().switch().name === "scvSymbol" && item.key().sym().toString() === field.name);
      const fieldPath = `${path} > field ${field.name}`;
      if (!entry) {
        mismatches.push({ path: fieldPath, expected: formatType(field.type), actual: "missing" });
        continue;
      }
      const nested = matches(field.type, entry.val(), fieldPath, model);
      if (!nested.ok) return nested;
      mismatches.push(...nested.value);
    }
    return ok(mismatches);
  }
  if (type.kind === "vec") {
    if (value.switch().name !== "scvVec") return ok([{ path, expected: formatType(type), actual: describeScVal(value) }]);
    const mismatches: Mismatch[] = [];
    for (const [index, item] of (value.vec() ?? []).entries()) {
      const nested = matches(type.items?.[0] ?? { kind: "void" }, item, `${path} > item ${index}`, model);
      if (!nested.ok) return nested;
      mismatches.push(...nested.value);
    }
    return ok(mismatches);
  }
  const actual = describeScVal(value);
  const expected = formatType(type);
  if (type.kind === "map") {
    return ok(value.switch().name === "scvMap" ? [] : [{ path, expected, actual }]);
  }
  return ok(actual === type.kind ? [] : [{ path, expected, actual }]);
}

export function matchArguments(model: SpecModel, selected: string, args: xdr.ScVal[]): Result<Mismatch[], ErrorCode> {
  const fn = model.functions.find((item) => item.name === selected);
  if (!fn) return err("unknown_function");
  return matchFunction(model, fn, args);
}

export function matchFunction(model: SpecModel, fn: SpecFunction, args: xdr.ScVal[]): Result<Mismatch[], ErrorCode> {
  if (args.length !== fn.inputs.length) return err("argument_count_mismatch");
  const mismatches: Mismatch[] = [];
  for (const [index, input] of fn.inputs.entries()) {
    const nested = matches(input.type, args[index] as xdr.ScVal, `argument ${index + 1}`, model);
    if (!nested.ok) return nested;
    mismatches.push(...nested.value);
  }
  return ok(mismatches);
}
