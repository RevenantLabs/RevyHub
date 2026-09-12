import { describe, expect, it } from "vitest";
import { formatHexMuxedId, formatMuxedId } from "@/features/muxed-account-codec/lib/format";
import {
  largeId,
  maxUint64Id,
  smallId,
  zeroId
} from "@/features/muxed-account-codec/fixtures/muxedAccountCodec.fixture";

describe("format", () => {
  describe("formatMuxedId", () => {
    it("formats 0", () => {
      expect(formatMuxedId(zeroId)).toBe("0");
    });

    it("formats small numbers", () => {
      expect(formatMuxedId(smallId)).toBe("42");
    });

    it("formats large numbers with commas", () => {
      expect(formatMuxedId(largeId)).toBe("123,456,789,012,345,678");
    });

    it("formats max uint64", () => {
      expect(formatMuxedId(maxUint64Id)).toBe("18,446,744,073,709,551,615");
    });

    it("falls back gracefully for invalid numbers", () => {
      expect(formatMuxedId("invalid")).toBe("invalid");
    });
  });

  describe("formatHexMuxedId", () => {
    it("formats 0 into zero-padded 16-character hex", () => {
      expect(formatHexMuxedId(zeroId)).toBe("0x0000000000000000");
    });

    it("formats 42 into zero-padded hex", () => {
      expect(formatHexMuxedId(smallId)).toBe("0x000000000000002A");
    });

    it("formats max uint64 into all Fs", () => {
      expect(formatHexMuxedId(maxUint64Id)).toBe("0xFFFFFFFFFFFFFFFF");
    });

    it("falls back gracefully for invalid numbers", () => {
      expect(formatHexMuxedId("invalid")).toBe("invalid");
    });
  });
});
