import { describe, expect, it } from "vitest";
import { isStellarNetwork, STELLAR_NETWORKS } from "@/core/network/types";
import {
  HORIZON_URLS,
  NETWORK_LABELS,
  NETWORK_META,
  NETWORK_PASSPHRASES,
  SOROBAN_RPC_URLS
} from "@/core/network/config";

describe("isStellarNetwork", () => {
  it("accepts the two selectable networks", () => {
    expect(isStellarNetwork("testnet")).toBe(true);
    expect(isStellarNetwork("mainnet")).toBe(true);
  });

  it("rejects anything else, including near misses", () => {
    for (const value of ["public", "PUBLIC", "futurenet", "", null, undefined, 1, {}]) {
      expect(isStellarNetwork(value)).toBe(false);
    }
  });
});

describe("network configuration", () => {
  it("defines a URL, passphrase, label and meta for every network", () => {
    for (const network of STELLAR_NETWORKS) {
      expect(HORIZON_URLS[network]).toMatch(/^https:\/\//);
      expect(SOROBAN_RPC_URLS[network]).toMatch(/^https:\/\//);
      expect(NETWORK_PASSPHRASES[network]).toContain("September 2015");
      expect(NETWORK_LABELS[network]).toBeTruthy();
      expect(NETWORK_META[network].blurb).toBeTruthy();
    }
  });

  it("gives mainnet the cautious tone because it moves real value", () => {
    expect(NETWORK_META.mainnet.tone).toBe("warning");
    expect(NETWORK_META.testnet.tone).toBe("info");
  });

  it("keeps the two passphrases distinct", () => {
    expect(NETWORK_PASSPHRASES.testnet).not.toBe(NETWORK_PASSPHRASES.mainnet);
  });
});
