import { expect, it } from "vitest";
import { describeScVal, parseArgumentXdr } from "../lib/scval-shape";
import { xdr } from "@stellar/stellar-sdk";
import { amountArg } from "../fixtures/contract-spec.fixture";

it("describes a u32 and rejects trailing bytes", () => {
  const parsed = parseArgumentXdr(amountArg);
  expect(parsed.ok).toBe(true);
  if (!parsed.ok) return;
  expect(describeScVal(parsed.value[0] as xdr.ScVal)).toBe("u32");
  expect(parseArgumentXdr(`${amountArg}AAAA`).ok).toBe(false);
});
