import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { NETWORK_PASSPHRASES } from "@/core/network/config";
import { networkId } from "@/features/signing-payload-inspector/lib/network-id";

describe("networkId", () => {
  it.each(["testnet", "mainnet"] as const)("hashes the %s passphrase as UTF-8", (network) => {
    expect(networkId(network).toString("hex")).toBe(
      createHash("sha256").update(NETWORK_PASSPHRASES[network], "utf8").digest("hex")
    );
    expect(networkId(network)).toHaveLength(32);
  });
  it("produces different IDs for testnet and mainnet", () => {
    expect(networkId("testnet")).not.toEqual(networkId("mainnet"));
  });
});
