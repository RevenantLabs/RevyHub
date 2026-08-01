import { describe, expect, it } from "vitest";
import {
  getHorizonServer,
  getNetworkLabel,
  horizonUrls,
  normalizeNetwork,
  stellarNetworks
} from "../../lib/stellar/horizon";

describe("normalizeNetwork", () => {
  it("keeps recognized networks", () => {
    expect(normalizeNetwork("mainnet")).toBe("mainnet");
    expect(normalizeNetwork("testnet")).toBe("testnet");
  });

  it("falls back to testnet for unknown or missing values", () => {
    expect(normalizeNetwork("public")).toBe("testnet");
    expect(normalizeNetwork("")).toBe("testnet");
    expect(normalizeNetwork(null)).toBe("testnet");
    expect(normalizeNetwork(undefined)).toBe("testnet");
  });
});

describe("getNetworkLabel", () => {
  it("labels every selectable network", () => {
    expect(getNetworkLabel("testnet")).toBe("Testnet");
    expect(getNetworkLabel("mainnet")).toBe("Mainnet");
  });
});

describe("horizon endpoints", () => {
  it("points each network at a distinct Horizon host", () => {
    expect(horizonUrls.testnet).not.toBe(horizonUrls.mainnet);
  });

  it("builds a server per selected network", () => {
    for (const network of stellarNetworks) {
      expect(getHorizonServer(network).serverURL.toString()).toContain(
        new URL(horizonUrls[network]).host
      );
    }
  });
});
