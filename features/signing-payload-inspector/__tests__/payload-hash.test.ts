import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import { payloadHash } from "@/features/signing-payload-inspector/lib/payload-hash";
import { classicXdr } from "@/features/signing-payload-inspector/fixtures/classic-envelope.fixture";

it("hashes exact signature-base bytes, matching the SDK transaction hash", () => {
  const transaction = TransactionBuilder.fromXDR(classicXdr, Networks.TESTNET);
  const bytes = transaction.signatureBase();
  expect(payloadHash(bytes)).toEqual(transaction.hash());
  expect(payloadHash(bytes).toString("hex")).toBe(createHash("sha256").update(bytes).digest("hex"));
});

describe("payloadHash", () => {
  it("changes if a single signature-base byte changes", () => {
    const first = Buffer.from([0, 0, 0, 2]);
    const second = Buffer.from([0, 0, 0, 5]);
    expect(payloadHash(first)).not.toEqual(payloadHash(second));
  });
});
