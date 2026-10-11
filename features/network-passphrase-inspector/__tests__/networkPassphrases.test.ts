import { describe, it, expect } from "vitest";
import {
  getNetworkPassphraseReference,
  searchNetworks,
  getNetworkByPassphrase,
  getMainnet,
  getTestnet,
  STELLAR_NETWORKS,
} from "@/features/network-passphrase-inspector/lib/networkPassphrases";
import { Networks } from "@stellar/stellar-sdk";

describe("getNetworkPassphraseReference", () => {
  it("returns all networks", () => {
    const ref = getNetworkPassphraseReference();
    expect(ref.networks.length).toBeGreaterThan(0);
    expect(ref.networks.length).toBe(STELLAR_NETWORKS.length);
  });

  it("groups by type", () => {
    const ref = getNetworkPassphraseReference();
    expect(ref.byType.mainnet.length).toBe(1);
    expect(ref.byType.testnet.length).toBe(1);
  });
});

describe("searchNetworks", () => {
  it("returns all for empty query", () => {
    expect(searchNetworks("").length).toBe(STELLAR_NETWORKS.length);
  });

  it("finds by name", () => {
    const results = searchNetworks("mainnet");
    expect(results.length).toBeGreaterThan(0);
    results.forEach(n => expect(n.type).toBe("mainnet"));
  });

  it("finds by passphrase", () => {
    const results = searchNetworks(Networks.TESTNET);
    expect(results.length).toBeGreaterThan(0);
  });

  it("filters by type", () => {
    const results = searchNetworks("", "testnet");
    results.forEach(n => expect(n.type).toBe("testnet"));
  });
});

describe("getNetworkByPassphrase", () => {
  it("finds mainnet", () => {
    const network = getNetworkByPassphrase(Networks.PUBLIC);
    expect(network?.type).toBe("mainnet");
  });

  it("finds testnet", () => {
    const network = getNetworkByPassphrase(Networks.TESTNET);
    expect(network?.type).toBe("testnet");
  });

  it("returns undefined for unknown", () => {
    expect(getNetworkByPassphrase("unknown")).toBeUndefined();
  });
});

describe("convenience functions", () => {
  it("getMainnet returns mainnet", () => {
    expect(getMainnet().type).toBe("mainnet");
  });

  it("getTestnet returns testnet", () => {
    expect(getTestnet().type).toBe("testnet");
  });
});
