import { xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode } from "../types";

export const MAX_ARG_CHARS = 80_000;

function canonical(value: string): Buffer | null {
  const normalized = value.replace(/\s/g, "");
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) return null;
  const bytes = Buffer.from(normalized, "base64");
  return bytes.toString("base64") === normalized ? bytes : null;
}

export function describeScVal(value: xdr.ScVal): string {
  switch (value.switch().name) {
    case "scvBool":
      return value.b() ? "bool" : "bool";
    case "scvVoid":
      return "void";
    case "scvU32":
      return "u32";
    case "scvSymbol":
      return "symbol";
    case "scvString":
      return "string";
    case "scvBytes":
      return "bytes";
    case "scvAddress":
      return "address";
    case "scvVec":
      return `vec<${(value.vec() ?? []).map((item) => describeScVal(item)).join("|") || "empty"}>`;
    case "scvMap":
      return "map";
    default:
      return value.switch().name;
  }
}

export function parseArgumentXdr(raw: string): Result<xdr.ScVal[], ErrorCode> {
  if (raw.length > MAX_ARG_CHARS) return err("too_large");
  const lines = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const values: xdr.ScVal[] = [];
  for (const line of lines) {
    const bytes = canonical(line);
    if (!bytes) return err("invalid_arg_xdr");
    try {
      const value = xdr.ScVal.fromXDR(bytes);
      if (!value.toXDR().equals(bytes)) return err("invalid_arg_xdr");
      values.push(value);
    } catch {
      return err("invalid_arg_xdr");
    }
  }
  return ok(values);
}
