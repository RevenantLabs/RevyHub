import { scValToNative, xdr } from "@stellar/stellar-sdk";
import type { ConstructorArgSummary } from "../types";

function displayValue(value: unknown): string {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Uint8Array || Buffer.isBuffer(value)) return Buffer.from(value).toString("hex");
  if (typeof value === "object" && value !== null) {
    try {
      return JSON.stringify(value, (_key, v) => (typeof v === "bigint" ? v.toString() : v));
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/** Decodes constructor arguments into a display-ready, ScVal-type-labelled list. */
export function describeConstructorArgs(args: xdr.ScVal[]): ConstructorArgSummary[] {
  return args.map((scVal, index) => ({
    index,
    scValType: scVal.switch().name,
    display: displayValue(scValToNative(scVal))
  }));
}
