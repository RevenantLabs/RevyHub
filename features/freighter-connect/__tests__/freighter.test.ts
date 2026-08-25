import { describe, expect, it } from "vitest";
import { readWallet, requestAccess } from "@/features/freighter-connect/lib/freighter";
import {
  connectedApi,
  futurenetApi,
  incompleteApi,
  lockedApi,
  mainnetApi,
  throwingApi,
  walletPublicKey,
  windowWith
} from "@/features/freighter-connect/fixtures/freighterConnect.fixture";

describe("readWallet", () => {
  it("reports a missing extension", async () => {
    expect(await readWallet(windowWith(undefined))).toEqual({
      ok: false,
      code: "not_installed"
    });
  });

  it("reports an extension exposing a different API", async () => {
    expect(await readWallet(windowWith(incompleteApi))).toEqual({
      ok: false,
      code: "api_incomplete"
    });
  });

  it("reads the public key and network of a connected wallet", async () => {
    const result = await readWallet(windowWith(connectedApi));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      installed: true,
      allowed: true,
      publicKey: walletPublicKey,
      network: "testnet"
    });
  });

  it("treats a wallet that has not granted access as a state, not an error", async () => {
    const result = await readWallet(windowWith(lockedApi));

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toMatchObject({ installed: true, allowed: false });
  });

  it("does not read a public key before access is granted", async () => {
    const result = await readWallet(windowWith(lockedApi));
    expect(result.ok && result.value.publicKey).toBeUndefined();
  });

  it("normalises the mainnet network name", async () => {
    const result = await readWallet(windowWith(mainnetApi));
    expect(result.ok && result.value.network).toBe("mainnet");
  });

  it("reports an unrecognised network rather than guessing", async () => {
    const result = await readWallet(windowWith(futurenetApi));
    expect(result.ok && result.value).toMatchObject({
      network: "unknown",
      rawNetwork: "FUTURENET"
    });
  });

  it("reports a wallet that throws while being read", async () => {
    expect(await readWallet(windowWith(throwingApi))).toEqual({
      ok: false,
      code: "read_failed"
    });
  });
});

describe("requestAccess", () => {
  it("reads the wallet after permission is granted", async () => {
    const result = await requestAccess(windowWith(connectedApi));
    expect(result.ok && result.value.allowed).toBe(true);
  });

  it("reports a refused permission request", async () => {
    const refusing = {
      ...connectedApi,
      setAllowed: async () => {
        throw new Error("user dismissed");
      }
    };

    expect(await requestAccess(windowWith(refusing))).toEqual({
      ok: false,
      code: "not_allowed"
    });
  });

  it("reports a missing extension", async () => {
    expect(await requestAccess(windowWith(undefined))).toEqual({
      ok: false,
      code: "not_installed"
    });
  });
});
