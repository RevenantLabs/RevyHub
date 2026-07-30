import { describe, expect, it } from "vitest";
import { normalizeFreighterNetwork } from "../../lib/stellar/freighter";

describe("normalizeFreighterNetwork", () => {
  describe("known identifiers (case-insensitive, trimmed)", () => {
    it("maps PUBLIC to mainnet", () => {
      expect(normalizeFreighterNetwork("PUBLIC")).toEqual({
        status: "supported",
        network: "mainnet",
        reported: "PUBLIC"
      });
    });

    it("accepts mixed case PUBLIC variants", () => {
      expect(normalizeFreighterNetwork("Public")).toEqual({
        status: "supported",
        network: "mainnet",
        reported: "Public"
      });
      expect(normalizeFreighterNetwork("public")).toEqual({
        status: "supported",
        network: "mainnet",
        reported: "public"
      });
    });

    it("maps TESTNET to testnet", () => {
      expect(normalizeFreighterNetwork("TESTNET")).toEqual({
        status: "supported",
        network: "testnet",
        reported: "TESTNET"
      });
    });

    it("accepts mixed case TESTNET variants", () => {
      expect(normalizeFreighterNetwork("Testnet")).toEqual({
        status: "supported",
        network: "testnet",
        reported: "Testnet"
      });
      expect(normalizeFreighterNetwork("testnet")).toEqual({
        status: "supported",
        network: "testnet",
        reported: "testnet"
      });
    });

    it("trims surrounding whitespace before matching", () => {
      expect(normalizeFreighterNetwork("  PUBLIC  ")).toEqual({
        status: "supported",
        network: "mainnet",
        reported: "PUBLIC"
      });
      expect(normalizeFreighterNetwork("\tTESTNET\n")).toEqual({
        status: "supported",
        network: "testnet",
        reported: "TESTNET"
      });
    });
  });

  describe("unsupported identifiers (no crash, no false-positive match)", () => {
    it("classifies FUTURENET as unsupported", () => {
      expect(normalizeFreighterNetwork("FUTURENET")).toEqual({
        status: "unsupported",
        reported: "FUTURENET"
      });
    });

    it("classifies custom or unknown names as unsupported", () => {
      expect(normalizeFreighterNetwork("local-standalone")).toEqual({
        status: "unsupported",
        reported: "local-standalone"
      });
      expect(normalizeFreighterNetwork("CUSTOM")).toEqual({
        status: "unsupported",
        reported: "CUSTOM"
      });
      expect(normalizeFreighterNetwork("mainnet-testbed")).toEqual({
        status: "unsupported",
        reported: "mainnet-testbed"
      });
    });

    it("returns the originally reported string (after trim) so the UI can echo it", () => {
      expect(normalizeFreighterNetwork("  Futurenet  ")).toEqual({
        status: "unsupported",
        reported: "Futurenet"
      });
    });
  });

  describe("missing responses (distinct from unsupported)", () => {
    it("treats null as missing", () => {
      expect(normalizeFreighterNetwork(null)).toEqual({ status: "missing" });
    });

    it("treats undefined as missing", () => {
      expect(normalizeFreighterNetwork(undefined)).toEqual({ status: "missing" });
    });

    it("treats an empty string as missing", () => {
      expect(normalizeFreighterNetwork("")).toEqual({ status: "missing" });
    });

    it("treats whitespace-only strings as missing", () => {
      expect(normalizeFreighterNetwork("   ")).toEqual({ status: "missing" });
    });
  });
});
