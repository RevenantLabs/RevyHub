import { describe, expect, it } from "vitest";
import {
  decodeMuxedAddress,
  encodeMuxedAddress,
  runMuxedAccountCodec
} from "@/features/muxed-account-codec/lib/muxedAccountCodec";
import {
  floatId,
  invalidBaseAddress,
  invalidMuxedAddress,
  largeId,
  maxUint64Id,
  muxedAddressLargeId,
  muxedAddressMaxId,
  muxedAddressSmallId,
  muxedAddressZeroId,
  negativeId,
  nonNumericId,
  overflowId,
  secretSeed,
  smallId,
  validBaseAddress1,
  validBaseAddress2,
  zeroId
} from "@/features/muxed-account-codec/fixtures/muxedAccountCodec.fixture";

describe("muxedAccountCodec", () => {
  describe("decodeMuxedAddress", () => {
    it("decodes an M-address into its base G-address and ID = 0", () => {
      const result = decodeMuxedAddress(muxedAddressZeroId);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.baseAddress).toBe(validBaseAddress1);
      expect(result.value.id).toBe(zeroId);
    });

    it("decodes an M-address with a small ID", () => {
      const result = decodeMuxedAddress(muxedAddressSmallId);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.baseAddress).toBe(validBaseAddress1);
      expect(result.value.id).toBe(smallId);
    });

    it("decodes an M-address with an ID beyond Number.MAX_SAFE_INTEGER", () => {
      const result = decodeMuxedAddress(muxedAddressLargeId);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.baseAddress).toBe(validBaseAddress1);
      expect(result.value.id).toBe(largeId);
    });

    it("decodes an M-address with the maximum 64-bit uint (2^64 - 1)", () => {
      const result = decodeMuxedAddress(muxedAddressMaxId);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.baseAddress).toBe(validBaseAddress1);
      expect(result.value.id).toBe(maxUint64Id);
    });

    it("rejects an invalid M-address checksum", () => {
      const result = decodeMuxedAddress(invalidMuxedAddress);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_muxed_address");
    });

    it("rejects secret seed starting with S", () => {
      const result = decodeMuxedAddress(secretSeed);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_muxed_address");
    });
  });

  describe("encodeMuxedAddress", () => {
    it("encodes a G-address and ID = 0 into an M-address", () => {
      const result = encodeMuxedAddress(validBaseAddress1, zeroId);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.muxedAddress).toBe(muxedAddressZeroId);
    });

    it("encodes a G-address and large 64-bit ID", () => {
      const result = encodeMuxedAddress(validBaseAddress1, largeId);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.muxedAddress).toBe(muxedAddressLargeId);
    });

    it("encodes a G-address and max uint64 ID without precision truncation", () => {
      const result = encodeMuxedAddress(validBaseAddress1, maxUint64Id);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.muxedAddress).toBe(muxedAddressMaxId);
    });

    it("rejects an invalid base G-address", () => {
      const result = encodeMuxedAddress(invalidBaseAddress, "10");
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_base_address");
    });

    it("rejects secret seed in encode mode", () => {
      const result = encodeMuxedAddress(secretSeed, "10");
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_base_address");
    });

    it("rejects negative ID values", () => {
      const result = encodeMuxedAddress(validBaseAddress1, negativeId);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_id");
    });

    it("rejects float ID values", () => {
      const result = encodeMuxedAddress(validBaseAddress1, floatId);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_id");
    });

    it("rejects non-numeric ID strings", () => {
      const result = encodeMuxedAddress(validBaseAddress1, nonNumericId);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_id");
    });

    it("rejects IDs overflowing uint64", () => {
      const result = encodeMuxedAddress(validBaseAddress1, overflowId);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_id");
    });
  });

  describe("round-tripping", () => {
    it("encodes and decodes back to the exact original pair", () => {
      const pairs: Array<{ base: string; id: string }> = [
        { base: validBaseAddress1, id: zeroId },
        { base: validBaseAddress1, id: smallId },
        { base: validBaseAddress1, id: largeId },
        { base: validBaseAddress1, id: maxUint64Id },
        { base: validBaseAddress2, id: "9876543210987654321" }
      ];

      for (const pair of pairs) {
        const encoded = encodeMuxedAddress(pair.base, pair.id);
        expect(encoded.ok).toBe(true);
        if (!encoded.ok) continue;

        const decoded = decodeMuxedAddress(encoded.value.muxedAddress);
        expect(decoded.ok).toBe(true);
        if (!decoded.ok) continue;

        expect(decoded.value.baseAddress).toBe(pair.base);
        expect(decoded.value.id).toBe(pair.id);

        const reEncoded = encodeMuxedAddress(decoded.value.baseAddress, decoded.value.id);
        expect(reEncoded.ok).toBe(true);
        if (!reEncoded.ok) continue;
        expect(reEncoded.value.muxedAddress).toBe(encoded.value.muxedAddress);
      }
    });
  });

  describe("runMuxedAccountCodec", () => {
    it("handles decode input", () => {
      const result = runMuxedAccountCodec({
        mode: "decode",
        muxedAddress: muxedAddressSmallId
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.baseAddress).toBe(validBaseAddress1);
      expect(result.value.id).toBe(smallId);
    });

    it("handles encode input", () => {
      const result = runMuxedAccountCodec({
        mode: "encode",
        baseAddress: validBaseAddress1,
        id: smallId
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.muxedAddress).toBe(muxedAddressSmallId);
    });

    it("returns empty_input when missing parameters", () => {
      const result = runMuxedAccountCodec({
        mode: "decode"
      });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("empty_input");
    });
  });
});
