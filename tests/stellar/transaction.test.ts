import { beforeEach, describe, expect, it, vi } from "vitest";
import { Horizon } from "@stellar/stellar-sdk";
import { lookupTransaction, isLikelyTransactionHash, type RawTransactionData } from "../../lib/stellar/transaction";

vi.mock("@/lib/stellar/horizon", () => ({
  getHorizonServer: vi.fn(),
  STELLAR_NETWORK: "testnet",
}));

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

describe("RawTransactionData", () => {
  const mockTx = {
    hash: "a".repeat(64),
    ledger_attr: 12345,
    source_account: "GABCDEF123456789",
    fee_charged: "100",
    created_at: "2024-06-15T12:00:00Z",
    successful: true,
    operation_count: 3,
    paging_token: "123-456789",
    envelope_xdr: "AAAAAgAAAAA...",
    result_xdr: "AAAAAAAAAGQ...",
    result_meta_xdr: "AAAAAgAAAAA...",
    fee_meta_xdr: "AAAAAQAAAAA...",
    max_fee: "200",
    fee_account: "GXYZ789",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockServer(data: object) {
    return {
      transactions: () => ({
        transaction: () => ({
          call: () => Promise.resolve(data),
        }),
      }),
    } as unknown as Horizon.Server;
  }

  it("extracts all raw fields from a Horizon transaction response", async () => {
    const { getHorizonServer } = await import("@/lib/stellar/horizon");
    vi.mocked(getHorizonServer).mockReturnValue(createMockServer(mockTx));

    const result = await lookupTransaction("a".repeat(64));

    expect(result.raw).toBeDefined();
    expect(result.raw!.pagingToken).toBe("123-456789");
    expect(result.raw!.envelopeXdr).toBe("AAAAAgAAAAA...");
    expect(result.raw!.resultXdr).toBe("AAAAAAAAAGQ...");
    expect(result.raw!.resultMetaXdr).toBe("AAAAAgAAAAA...");
    expect(result.raw!.feeMetaXdr).toBe("AAAAAQAAAAA...");
    expect(result.raw!.maxFee).toBe("200");
    expect(result.raw!.feeAccount).toBe("GXYZ789");
  });

  it("handles missing optional raw fields gracefully", async () => {
    const { getHorizonServer } = await import("@/lib/stellar/horizon");
    const partialMock = {
      ...mockTx,
      result_meta_xdr: undefined,
      fee_meta_xdr: undefined,
      fee_account: undefined,
    };

    vi.mocked(getHorizonServer).mockReturnValue(createMockServer(partialMock));

    const result = await lookupTransaction("a".repeat(64));

    expect(result.raw).toBeDefined();
    expect(result.raw!.resultMetaXdr).toBeUndefined();
    expect(result.raw!.feeMetaXdr).toBeUndefined();
    expect(result.raw!.feeAccount).toBeUndefined();
    expect(result.raw!.pagingToken).toBe("123-456789");
    expect(result.raw!.maxFee).toBe("200");
  });

  it("includes raw data in the JSON serialization", () => {
    const raw: RawTransactionData = {
      pagingToken: "123-456",
      envelopeXdr: "AAAA...",
      resultXdr: "AAAA...",
      maxFee: "100",
    };

    const json = JSON.parse(JSON.stringify(raw));
    expect(json.pagingToken).toBe("123-456");
    expect(json.envelopeXdr).toBe("AAAA...");
    expect(json.resultXdr).toBe("AAAA...");
    expect(json.maxFee).toBe("100");
    expect(json.resultMetaXdr).toBeUndefined();
  });
});
