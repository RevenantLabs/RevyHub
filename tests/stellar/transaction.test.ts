import { describe, expect, it } from "vitest";
import { isLikelyTransactionHash, normalizeOperation } from "../../lib/stellar/transaction";

/* ------------------------------------------------------------------ */
/*  isLikelyTransactionHash                                            */
/* ------------------------------------------------------------------ */

describe("isLikelyTransactionHash", () => {
  it("accepts 64-character hexadecimal hashes", () => {
    expect(isLikelyTransactionHash("a".repeat(64))).toBe(true);
    expect(isLikelyTransactionHash("ABCDEF0123456789".repeat(4))).toBe(true);
  });

  it("rejects hashes with invalid length or characters", () => {
    expect(isLikelyTransactionHash("a".repeat(63))).toBe(false);
    expect(isLikelyTransactionHash("z".repeat(64))).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  normalizeOperation                                                 */
/* ------------------------------------------------------------------ */

describe("normalizeOperation", () => {
  it("normalises a payment operation", () => {
    const op = normalizeOperation({
      id: "123",
      type: "payment",
      source_account: "GAABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "deadbeef",
      from: "GAABC",
      to: "GBDEF",
      amount: "100.0000000",
      asset_type: "native"
    });

    expect(op.type).toBe("payment");
    expect(op.typeLabel).toBe("Payment");
    expect(op.from).toBe("GAABC");
    expect(op.to).toBe("GBDEF");
    expect(op.amount).toBe("100.0000000");
    expect(op.assetType).toBe("native");
  });

  it("normalises a create_account operation", () => {
    const op = normalizeOperation({
      id: "456",
      type: "create_account",
      source_account: "GAABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "deadbeef",
      funder: "GAABC",
      account: "GBDEF",
      starting_balance: "1000.0000000"
    });

    expect(op.type).toBe("create_account");
    expect(op.typeLabel).toBe("Create Account");
    expect(op.funder).toBe("GAABC");
    expect(op.account).toBe("GBDEF");
    expect(op.startingBalance).toBe("1000.0000000");
  });

  it("normalises a change_trust operation", () => {
    const op = normalizeOperation({
      id: "789",
      type: "change_trust",
      source_account: "GAABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "deadbeef",
      asset_code: "USDC",
      asset_issuer: "GBDEF",
      limit: "5000.0000000"
    });

    expect(op.type).toBe("change_trust");
    expect(op.typeLabel).toBe("Change Trust");
    expect(op.assetCode).toBe("USDC");
    expect(op.assetIssuer).toBe("GBDEF");
    expect(op.limit).toBe("5000.0000000");
  });

  it("normalises a manage_data operation", () => {
    const op = normalizeOperation({
      id: "101",
      type: "manage_data",
      source_account: "GAABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "deadbeef",
      data_name: "Hello",
      data_value: "d29ybGQ="
    });

    expect(op.type).toBe("manage_data");
    expect(op.typeLabel).toBe("Manage Data");
    expect(op.dataName).toBe("Hello");
    expect(op.dataValue).toBe("d29ybGQ=");
  });

  it("normalises an unknown operation type with a human-readable label", () => {
    const op = normalizeOperation({
      id: "202",
      type: "some_new_feature",
      source_account: "GAABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "deadbeef"
    });

    expect(op.type).toBe("some_new_feature");
    expect(op.typeLabel).toBe("Some New Feature");
  });

  it("handles empty type gracefully", () => {
    const op = normalizeOperation({
      id: "303",
      type: "",
      source_account: "GAABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "deadbeef"
    });

    expect(op.type).toBe("");
    expect(op.typeLabel).toBe("");
  });
});
