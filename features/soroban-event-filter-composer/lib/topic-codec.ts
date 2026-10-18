import { xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, TopicSelector } from "../types";

const SYMBOL = /^[A-Za-z0-9_]{1,32}$/;

function canonicalBase64(value: string): Buffer | null {
  const normalized = value.replace(/\s/g, "");
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) {
    return null;
  }
  const bytes = Buffer.from(normalized, "base64");
  return bytes.toString("base64") === normalized ? bytes : null;
}

/** Turn one user selector into the exact topic token getEvents expects. */
export function encodeTopicSelector(raw: string): Result<TopicSelector, ErrorCode> {
  const value = raw.trim();
  if (value === "*") return ok("*");
  if (value.startsWith("sym:")) {
    const symbol = value.slice(4);
    if (!SYMBOL.test(symbol)) return err("invalid_topic");
    return ok(xdr.ScVal.scvSymbol(symbol).toXDR("base64"));
  }
  const bytes = canonicalBase64(value);
  if (!bytes) return err("invalid_topic");
  try {
    const decoded = xdr.ScVal.fromXDR(bytes);
    if (!decoded.toXDR().equals(bytes)) return err("invalid_topic");
  } catch {
    return err("invalid_topic");
  }
  return ok(bytes.toString("base64"));
}

/** Decode a topic or value XDR string for display. Malformed XDR stays unrendered. */
export function decodeTopicXdr(encoded: string): Result<string, ErrorCode> {
  const bytes = canonicalBase64(encoded.trim());
  if (!bytes) return err("invalid_topic");
  try {
    return ok(describeScVal(xdr.ScVal.fromXDR(bytes)));
  } catch {
    return err("invalid_topic");
  }
}

export function describeScVal(value: xdr.ScVal): string {
  switch (value.switch().name) {
    case "scvBool":
      return value.b() ? "bool true" : "bool false";
    case "scvVoid":
      return "void";
    case "scvU32":
      return `u32 ${value.u32()}`;
    case "scvSymbol":
      return `symbol ${value.sym().toString()}`;
    case "scvString":
      return `string ${value.str().toString()}`;
    case "scvBytes":
      return `bytes ${value.bytes().toString("hex")}`;
    case "scvAddress":
      return "address";
    case "scvVec":
      return `vec[${(value.vec() ?? []).map((item) => describeScVal(item)).join(", ")}]`;
    default:
      return value.switch().name;
  }
}
