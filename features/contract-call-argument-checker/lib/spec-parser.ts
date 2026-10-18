import { xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, SpecModel, TypeNode } from "../types";

export const MAX_XDR_CHARS = 80_000;

function canonical(value: string): Buffer | null {
  const normalized = value.replace(/\s/g, "");
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) return null;
  const bytes = Buffer.from(normalized, "base64");
  return bytes.toString("base64") === normalized ? bytes : null;
}

function typeNode(def: xdr.ScSpecTypeDef): TypeNode {
  switch (def.switch().name) {
    case "scSpecTypeU32":
      return { kind: "u32" };
    case "scSpecTypeBool":
      return { kind: "bool" };
    case "scSpecTypeVoid":
      return { kind: "void" };
    case "scSpecTypeSymbol":
      return { kind: "symbol" };
    case "scSpecTypeString":
      return { kind: "string" };
    case "scSpecTypeBytes":
      return { kind: "bytes" };
    case "scSpecTypeAddress":
      return { kind: "address" };
    case "scSpecTypeOption":
      return { kind: "option", items: [typeNode(def.option().valueType())] };
    case "scSpecTypeVec":
      return { kind: "vec", items: [typeNode(def.vec().elementType())] };
    case "scSpecTypeMap":
      return { kind: "map", items: [typeNode(def.map().keyType()), typeNode(def.map().valueType())] };
    case "scSpecTypeUdt":
      return { kind: "struct", name: def.udt().name().toString() };
    case "scSpecTypeResult":
      return { kind: "result" };
    default:
      return { kind: "unsupported" };
  }
}

function readEntry(line: string): Result<xdr.ScSpecEntry, ErrorCode> {
  const bytes = canonical(line);
  if (!bytes) return err("invalid_spec_xdr");
  try {
    const entry = xdr.ScSpecEntry.fromXDR(bytes);
    if (!entry.toXDR().equals(bytes)) return err("invalid_spec_xdr");
    return ok(entry);
  } catch {
    return err("invalid_spec_xdr");
  }
}

/** Decode newline-separated ScSpecEntry values. Nothing is retained outside the return value. */
export function parseSpec(raw: string): Result<SpecModel, ErrorCode> {
  if (raw.length > MAX_XDR_CHARS) return err("too_large");
  const lines = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return err("invalid_spec_xdr");
  const model: SpecModel = { functions: [], structs: [] };
  for (const line of lines) {
    const entry = readEntry(line);
    if (!entry.ok) return entry;
    const name = entry.value.switch().name;
    if (name === "scSpecEntryFunctionV0") {
      const fn = entry.value.functionV0();
      model.functions.push({
        name: fn.name().toString(),
        inputs: fn.inputs().map((input) => ({ name: input.name().toString(), type: typeNode(input.type()) }))
      });
    } else if (name === "scSpecEntryUdtStructV0") {
      const struct = entry.value.udtStructV0();
      model.structs.push({
        name: struct.name().toString(),
        fields: struct.fields().map((field) => ({ name: field.name().toString(), type: typeNode(field.type()) }))
      });
    }
  }
  if (!model.functions.length) return err("invalid_spec_xdr");
  return ok(model);
}

export function formatType(type: TypeNode): string {
  if (type.kind === "option" || type.kind === "vec") return `${type.kind}<${formatType(type.items?.[0] ?? { kind: "void" })}>`;
  if (type.kind === "map") return `map<${formatType(type.items?.[0] ?? { kind: "void" })}, ${formatType(type.items?.[1] ?? { kind: "void" })}>`;
  if (type.kind === "struct") return `struct ${type.name}`;
  return type.kind;
}
