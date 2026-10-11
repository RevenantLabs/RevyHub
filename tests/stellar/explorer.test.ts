import { describe, expect, it } from "vitest";
import {
  getContractExplorerLink,
  getTransactionExplorerLink,
  getAccountExplorerLink,
  supportedExplorerNetworks
} from "../../lib/stellar/explorer";

describe("explorer", () => {
  describe("supportedExplorerNetworks", () => {
    it("includes testnet and mainnet", () => {
      expect(supportedExplorerNetworks).toEqual(["testnet", "mainnet"]);
    });
  });

  describe("getContractExplorerLink", () => {
    it("generates testnet link", () => {
      const result = getContractExplorerLink("CA3D5K7F7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7A", "testnet");

      expect(result.url).toBe("https://stellar.expert/explorer/testnet/contract/CA3D5K7F7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7A");
      expect(result.supported).toBe(true);
      expect(result.label).toMatch(/testnet/);
    });

    it("generates mainnet link", () => {
      const result = getContractExplorerLink("CA3D5K7F7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7A", "mainnet");

      expect(result.url).toBe("https://stellar.expert/explorer/public/contract/CA3D5K7F7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7A");
      expect(result.supported).toBe(true);
      expect(result.label).toMatch(/mainnet/);
    });

    it("marks all networks as supported", () => {
      for (const network of supportedExplorerNetworks) {
        const result = getContractExplorerLink("CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4", network);
        expect(result.supported).toBe(true);
      }
    });
  });

  describe("getTransactionExplorerLink", () => {
    it("generates testnet link", () => {
      const result = getTransactionExplorerLink("abcdef0123456789", "testnet");

      expect(result.url).toBe("https://stellar.expert/explorer/testnet/tx/abcdef0123456789");
      expect(result.supported).toBe(true);
    });

    it("generates mainnet link", () => {
      const result = getTransactionExplorerLink("abcdef0123456789", "mainnet");

      expect(result.url).toBe("https://stellar.expert/explorer/public/tx/abcdef0123456789");
      expect(result.supported).toBe(true);
    });
  });

  describe("getAccountExplorerLink", () => {
    it("generates testnet link", () => {
      const result = getAccountExplorerLink("GA...", "testnet");

      expect(result.url).toBe("https://stellar.expert/explorer/testnet/account/GA...");
      expect(result.supported).toBe(true);
    });

    it("generates mainnet link", () => {
      const result = getAccountExplorerLink("GA...", "mainnet");

      expect(result.url).toBe("https://stellar.expert/explorer/public/account/GA...");
      expect(result.supported).toBe(true);
    });
  });
});
