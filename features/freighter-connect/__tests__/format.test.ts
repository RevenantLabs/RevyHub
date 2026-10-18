import { describe, expect, it } from "vitest";
import { formatWalletNetwork, hasNetworkMismatch } from "@/features/freighter-connect/lib/format";
import { normalizeWalletNetwork } from "@/features/freighter-connect/lib/freighter.errors";

describe("normalizeWalletNetwork", () => {
  it.each([
    ["TESTNET", "testnet"],
    ["Test SDF Network ; September 2015", "testnet"],
    ["PUBLIC", "mainnet"],
    ["Public Global Stellar Network ; September 2015", "mainnet"],
    ["mainnet", "mainnet"],
    ["FUTURENET", "unknown"],
    ["", "unknown"],
    [undefined, "unknown"]
  ])("maps %s to %s", (raw, expected) => {
    expect(normalizeWalletNetwork(raw as string | undefined)).toBe(expected);
  });
});

describe("formatWalletNetwork", () => {
  it("names known networks", () => {
    expect(formatWalletNetwork("testnet")).toBe("Testnet");
    expect(formatWalletNetwork("mainnet")).toBe("Mainnet");
  });

  it("shows the raw value for an unrecognised network", () => {
    expect(formatWalletNetwork("unknown", "FUTURENET")).toBe("Unrecognised (FUTURENET)");
    expect(formatWalletNetwork("unknown")).toBe("Unknown");
  });
});

describe("hasNetworkMismatch", () => {
  const base = { installed: true, allowed: true } as const;

  it("flags a genuine mismatch", () => {
    expect(hasNetworkMismatch({ ...base, network: "mainnet" }, "testnet")).toBe(true);
  });

  it("does not flag matching networks", () => {
    expect(hasNetworkMismatch({ ...base, network: "testnet" }, "testnet")).toBe(false);
  });

  it("does not treat an unrecognised wallet network as a mismatch", () => {
    expect(hasNetworkMismatch({ ...base, network: "unknown" }, "testnet")).toBe(false);
  });

  it("does not flag a wallet that has not granted access", () => {
    expect(
      hasNetworkMismatch({ installed: true, allowed: false, network: "mainnet" }, "testnet")
    ).toBe(false);
  });
});
