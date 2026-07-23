import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FREIGHTER_ACCOUNT_POLL_MS,
  accountFromListenerEvent,
  readFreighterAccountState,
  subscribeFreighterAccountChanges,
  type FreighterApi
} from "../../lib/wallet/freighterAccount";

const KEY_A = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const KEY_B = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

describe("readFreighterAccountState", () => {
  it("returns the same connected account when wallet state is unchanged", async () => {
    const api: FreighterApi = {
      isConnected: async () => true,
      isAllowed: async () => true,
      getPublicKey: async () => KEY_A,
      getNetwork: async () => "TESTNET"
    };

    const first = await readFreighterAccountState(api);
    const second = await readFreighterAccountState(api);

    expect(first).toEqual({ connected: true, publicKey: KEY_A, walletNetwork: "TESTNET" });
    expect(second).toEqual(first);
  });

  it("returns a changed public key when Freighter switches accounts", async () => {
    let currentKey = KEY_A;
    const api: FreighterApi = {
      isConnected: async () => true,
      getPublicKey: async () => currentKey,
      getNetwork: async () => "TESTNET"
    };

    expect(await readFreighterAccountState(api)).toMatchObject({ publicKey: KEY_A });

    currentKey = KEY_B;

    expect(await readFreighterAccountState(api)).toMatchObject({ publicKey: KEY_B });
  });

  it("returns disconnected state when permission is revoked", async () => {
    const api: FreighterApi = {
      isConnected: async () => false,
      isAllowed: async () => false,
      getPublicKey: async () => KEY_A
    };

    expect(await readFreighterAccountState(api)).toEqual({
      connected: false,
      publicKey: "",
      walletNetwork: ""
    });
  });

  it("returns disconnected state when getPublicKey throws", async () => {
    const api: FreighterApi = {
      isConnected: async () => true,
      getPublicKey: async () => {
        throw new Error("revoked");
      }
    };

    expect(await readFreighterAccountState(api)).toEqual({
      connected: false,
      publicKey: "",
      walletNetwork: ""
    });
  });
});

describe("accountFromListenerEvent", () => {
  it("maps a changed account to connected state", () => {
    expect(accountFromListenerEvent(KEY_B)).toEqual({ connected: true, publicKey: KEY_B });
  });

  it("maps empty account values to disconnected state", () => {
    expect(accountFromListenerEvent("")).toEqual({ connected: false, publicKey: "" });
    expect(accountFromListenerEvent("   ")).toEqual({ connected: false, publicKey: "" });
  });
});

describe("subscribeFreighterAccountChanges", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates through account listeners and removes them on cleanup", async () => {
    let registeredListener: ((account: string) => void) | undefined;
    const removeAccountListener = vi.fn();
    const api: FreighterApi = {
      addAccountListener: (callback) => {
        registeredListener = callback;
      },
      removeAccountListener,
      getNetwork: async () => "TESTNET"
    };
    const onUpdate = vi.fn();

    const unsubscribe = subscribeFreighterAccountChanges(api, onUpdate);

    registeredListener?.(KEY_A);
    await Promise.resolve();
    registeredListener?.(KEY_B);
    await Promise.resolve();

    expect(onUpdate).toHaveBeenCalledWith({
      connected: true,
      publicKey: KEY_A,
      walletNetwork: ""
    });
    expect(onUpdate).toHaveBeenCalledWith({
      connected: true,
      publicKey: KEY_B,
      walletNetwork: ""
    });
    expect(onUpdate).toHaveBeenCalledWith({
      connected: true,
      publicKey: KEY_B,
      walletNetwork: "TESTNET"
    });

    unsubscribe();

    expect(removeAccountListener).toHaveBeenCalledTimes(1);
    expect(removeAccountListener.mock.calls[0][0]).toBe(registeredListener);
  });

  it("polls for account changes when listeners are unavailable", async () => {
    let currentKey = KEY_A;
    const api: FreighterApi = {
      isConnected: async () => true,
      getPublicKey: async () => currentKey,
      getNetwork: async () => "TESTNET"
    };
    const onUpdate = vi.fn();

    const unsubscribe = subscribeFreighterAccountChanges(api, onUpdate);

    await Promise.resolve();
    expect(onUpdate).toHaveBeenCalledWith({
      connected: true,
      publicKey: KEY_A,
      walletNetwork: "TESTNET"
    });

    currentKey = KEY_B;
    await vi.advanceTimersByTimeAsync(FREIGHTER_ACCOUNT_POLL_MS);

    expect(onUpdate).toHaveBeenCalledWith({
      connected: true,
      publicKey: KEY_B,
      walletNetwork: "TESTNET"
    });

    await vi.advanceTimersByTimeAsync(FREIGHTER_ACCOUNT_POLL_MS);
    const callCount = onUpdate.mock.calls.length;

    unsubscribe();

    await vi.advanceTimersByTimeAsync(FREIGHTER_ACCOUNT_POLL_MS);
    expect(onUpdate.mock.calls.length).toBe(callCount);
  });

  it("polls revoked access back to disconnected state", async () => {
    let connected = true;
    const api: FreighterApi = {
      isConnected: async () => connected,
      getPublicKey: async () => {
        if (!connected) {
          throw new Error("revoked");
        }

        return KEY_A;
      }
    };
    const onUpdate = vi.fn();

    subscribeFreighterAccountChanges(api, onUpdate);

    await Promise.resolve();
    connected = false;
    await vi.advanceTimersByTimeAsync(FREIGHTER_ACCOUNT_POLL_MS);

    expect(onUpdate).toHaveBeenCalledWith({
      connected: false,
      publicKey: "",
      walletNetwork: ""
    });
  });
});
