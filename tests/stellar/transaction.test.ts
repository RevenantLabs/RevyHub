import { describe, expect, it } from "vitest";
import { isLikelyTransactionHash, decodeTransactionEnvelope } from "../../lib/stellar/transaction";

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

describe("decodeTransactionEnvelope", () => {
  // Test fixture: Classic unsigned transaction (TX_V1) with payment operation
  const CLASSIC_UNSIGNED_XDR = "AAAAAgAAAABYGPBdhGcS9JRwiJmEVXtPDqLaWUgK/4yBCaQLaBXcLQAAAGQAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAABl8tOYAAAAAAAAAAEAAAAAAAAAAQAAAACpGA8zFbvbO4s3zYwZw5YQjdOc0p/wETfEWbQVWWBpWQAAAAAAAAAAAJiWgAAAAAAAAAAA";

  // Test fixture: Classic signed transaction (TX_V1) with payment operation and 1 signature
  const CLASSIC_SIGNED_XDR = "AAAAAgAAAABYGPBdhGcS9JRwiJmEVXtPDqLaWUgK/4yBCaQLaBXcLQAAAGQAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAABl8tOYAAAAAAAAAAEAAAAAAAAAAQAAAACpGA8zFbvbO4s3zYwZw5YQjdOc0p/wETfEWbQVWWBpWQAAAAAAAAAAAJiWgAAAAAAAAAAAAAAAAAEB2BjwXYRnEvSUcIiZhFV7Tw6i2llICv+MgQmkC2gV3C0AAABAOHPbKhKwqjqZGHqx4xECEqLqGxXx2uLCHqkO8E/5YHvCRZKBtfDrJmqYwqQGvUZZ0d9B8k7f8LdKRqfG5VqXBg==";

  // Test fixture: Classic transaction with memo text
  const CLASSIC_WITH_MEMO_TEXT_XDR = "AAAAAgAAAABYGPBdhGcS9JRwiJmEVXtPDqLaWUgK/4yBCaQLaBXcLQAAAGQAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAABl8tOYAAAAAQAAAA10ZXN0IG1lc3NhZ2UAAAAAAAAAAAEAAAAAAAAAAQAAAACPGA8zFbvbO4s3zYwZw5YQjdOc0p/wETfEWbQVWWBpWQAAAAAAAAAAAJiWgAAAAAAAAAAA";

  // Test fixture: Classic transaction with memo ID
  const CLASSIC_WITH_MEMO_ID_XDR = "AAAAAgAAAABYGPBdhGcS9JRwiJmEVXtPDqLaWUgK/4yBCaQLaBXcLQAAAGQAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAABl8tOYAAAAAAAAAAACAAAAAAAAAAEAAAABAAAAAQAAAACpGA8zFbvbO4s3zYwZw5YQjdOc0p/wETfEWbQVWWBpWQAAAAAAAAAAAJiWgAAAAAAAAAAA";

  // Test fixture: Classic transaction with multiple operations
  const CLASSIC_MULTI_OP_XDR = "AAAAAgAAAABYGPBdhGcS9JRwiJmEVXtPDqLaWUgK/4yBCaQLaBXcLQAAAMgAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAABl8tOYAAAAAAAAAAIAAAAAAAAAAQAAAACpGA8zFbvbO4s3zYwZw5YQjdOc0p/wETfEWbQVWWBpWQAAAAAAAAAAAJiWgAAAAAAAAAAAAAAABgAAAAFVU0RDAAAAAFgY8F2EZxL0lHCImYRVe08OotpZSAr/jIEJpAtoFdwteffffffffffffffwAAAAAAAAAA";

  // Test fixture: Fee-bump transaction
  const FEE_BUMP_XDR = "AAAABQAAAACpGA8zFbvbO4s3zYwZw5YQjdOc0p/wETfEWbQVWWBpWQAAAAAAAADIAAAAAgAAAABYGPBdhGcS9JRwiJmEVXtPDqLaWUgK/4yBCaQLaBXcLQAAAGQAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAABl8tOYAAAAAAAAAAEAAAAAAAAAAQAAAACpGA8zFbvbO4s3zYwZw5YQjdOc0p/wETfEWbQVWWBpWQAAAAAAAAAAAJiWgAAAAAAAAAAAAAAAAA==";

  describe("valid envelopes", () => {
    it("decodes classic unsigned transaction", () => {
      const result = decodeTransactionEnvelope(CLASSIC_UNSIGNED_XDR);
      
      expect(result.envelopeType).toBe("ENVELOPE_TYPE_TX");
      expect(result.sourceAccount).toMatch(/^G[A-Z2-7]{55}$/);
      expect(result.sequence).toBe("1");
      expect(result.fee).toBe("100");
      expect(result.memoType).toBe("MEMO_NONE");
      expect(result.memo).toBe("(none)");
      expect(result.signatureCount).toBe(0);
      expect(result.operations).toHaveLength(1);
      expect(result.operations[0].type).toBe("payment");
      expect(result.timeBounds).toBeDefined();
    });

    it("decodes classic signed transaction", () => {
      const result = decodeTransactionEnvelope(CLASSIC_SIGNED_XDR);
      
      expect(result.envelopeType).toBe("ENVELOPE_TYPE_TX");
      expect(result.signatureCount).toBe(1);
      expect(result.operations).toHaveLength(1);
    });

    it("decodes transaction with text memo", () => {
      const result = decodeTransactionEnvelope(CLASSIC_WITH_MEMO_TEXT_XDR);
      
      expect(result.memoType).toBe("MEMO_TEXT");
      expect(result.memo).toBe("test message");
    });

    it("decodes transaction with ID memo", () => {
      const result = decodeTransactionEnvelope(CLASSIC_WITH_MEMO_ID_XDR);
      
      expect(result.memoType).toBe("MEMO_ID");
      expect(result.memo).toBe("1");
    });

    it("decodes transaction with multiple operations", () => {
      const result = decodeTransactionEnvelope(CLASSIC_MULTI_OP_XDR);
      
      expect(result.operations).toHaveLength(2);
      expect(result.operations[0].type).toBe("payment");
      expect(result.operations[1].type).toBe("changeTrust");
      expect(result.fee).toBe("200");
    });

    it("decodes fee-bump transaction", () => {
      const result = decodeTransactionEnvelope(FEE_BUMP_XDR);
      
      expect(result.envelopeType).toBe("ENVELOPE_TYPE_TX_FEE_BUMP");
      expect(result.sourceAccount).toMatch(/^G[A-Z2-7]{55}$/);
      expect(result.fee).toBe("200");
      expect(result.operations).toHaveLength(1);
      expect(result.networkPassphrase).toBeDefined();
    });
  });

  describe("input validation", () => {
    it("rejects empty XDR", () => {
      expect(() => decodeTransactionEnvelope("")).toThrow("XDR string cannot be empty");
    });

    it("rejects whitespace-only XDR", () => {
      expect(() => decodeTransactionEnvelope("   ")).toThrow("XDR string cannot be empty");
    });

    it("rejects oversized XDR", () => {
      const oversized = "A".repeat(8193);
      expect(() => decodeTransactionEnvelope(oversized)).toThrow("XDR exceeds maximum size");
    });

    it("rejects malformed base64", () => {
      expect(() => decodeTransactionEnvelope("not-valid-base64!!!")).toThrow("Malformed XDR");
    });

    it("rejects non-transaction XDR", () => {
      // This is valid base64 but not a valid transaction envelope
      expect(() => decodeTransactionEnvelope("SGVsbG8gV29ybGQh")).toThrow();
    });
  });

  describe("edge cases", () => {
    it("handles XDR with leading/trailing whitespace", () => {
      const result = decodeTransactionEnvelope(`  ${CLASSIC_UNSIGNED_XDR}  `);
      expect(result.envelopeType).toBe("ENVELOPE_TYPE_TX");
    });

    it("extracts time bounds when present", () => {
      const result = decodeTransactionEnvelope(CLASSIC_UNSIGNED_XDR);
      expect(result.timeBounds).toBeDefined();
      expect(result.timeBounds?.minTime).toBe("0");
      expect(result.timeBounds?.maxTime).toBe("1707440792");
    });

    it("reports correct operation count", () => {
      const single = decodeTransactionEnvelope(CLASSIC_UNSIGNED_XDR);
      expect(single.operations).toHaveLength(1);

      const multi = decodeTransactionEnvelope(CLASSIC_MULTI_OP_XDR);
      expect(multi.operations).toHaveLength(2);
    });
  });

  describe("security", () => {
    it("enforces bounded input size", () => {
      const maxAllowed = "A".repeat(8192);
      // Should not throw for max size
      expect(() => decodeTransactionEnvelope(CLASSIC_UNSIGNED_XDR)).not.toThrow();
      
      // Should throw for over max size
      const overMax = "A".repeat(8193);
      expect(() => decodeTransactionEnvelope(overMax)).toThrow("exceeds maximum size");
    });

    it("does not expose raw XDR in error messages", () => {
      const sensitiveXdr = "SENSITIVE_DATA_12345";
      try {
        decodeTransactionEnvelope(sensitiveXdr);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).not.toContain(sensitiveXdr);
      }
    });
  });
});
