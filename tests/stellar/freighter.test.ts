import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  normalizeFreighterNetwork,
  readFreighterNetwork,
  walletNetworkStatus,
  watchFreighterNetwork,
  type FreighterApiShape
} from "../../lib/stellar/freighter";

describe("normalizeFreighterNetwork", () => {
  it("maps test-like values to testnet", () => {
    expect(normalizeFreighterNetwork("TESTNET")).toEqual({ kind: "testnet", label: "testnet" });
    expect(normalizeFreighterNetwork("testnet")).toEqual({ kind: "testnet", label: "testnet" });
  });

  it("maps public and mainnet values to mainnet", () => {
    expect(normalizeFreighterNetwork("PUBLIC")).toEqual({ kind: "mainnet", label: "mainnet" });
    expect(normalizeFreighterNetwork("MAINNET")).toEqual({ kind: "mainnet", label: "mainnet" });
  });

  it("marks unknown network values as unsupported with the raw label", () => {
    expect(normalizeFreighterNetwork("FUTURENET")).toEqual({ kind: "unsupported", label: "FUTURENET" });
  });

  it("marks empty input as unavailable", () => {
    expect(normalizeFreighterNetwork("")).toEqual({ kind: "unavailable", label: "" });
    expect(normalizeFreighterNetwork("   ")).toEqual({ kind: "unavailable", label: "" });
  });
});

describe("readFreighterNetwork", () => {
  it("returns the normalized network reported by the extension", async () => {
    const api: FreighterApiShape = { getNetwork: vi.fn(async () => "PUBLIC") };

    await expect(readFreighterNetwork(api)).resolves.toEqual({ kind: "mainnet", label: "mainnet" });
  });

  it("returns unavailable when getNetwork is missing", async () => {
    await expect(readFreighterNetwork({})).resolves.toEqual({ kind: "unavailable", label: "" });
    await expect(readFreighterNetwork(null)).resolves.toEqual({ kind: "unavailable", label: "" });
  });

  it("returns unavailable when getNetwork rejects", async () => {
    const api: FreighterApiShape = { getNetwork: vi.fn(async () => Promise.reject(new Error("denied"))) };

    await expect(readFreighterNetwork(api)).resolves.toEqual({ kind: "unavailable", label: "" });
  });
});

describe("walletNetworkStatus", () => {
  it("reports a match when the wallet network equals the app network", () => {
    expect(walletNetworkStatus({ kind: "testnet", label: "testnet" }, "testnet")).toBe("match");
    expect(walletNetworkStatus({ kind: "mainnet", label: "mainnet" }, "mainnet")).toBe("match");
  });

  it("reports a mismatch when the wallet network differs from the app network", () => {
    expect(walletNetworkStatus({ kind: "testnet", label: "testnet" }, "mainnet")).toBe("mismatch");
    expect(walletNetworkStatus({ kind: "mainnet", label: "mainnet" }, "testnet")).toBe("mismatch");
  });

  it("reports unsupported and unavailable results safely", () => {
    expect(walletNetworkStatus({ kind: "unsupported", label: "FUTURENET" }, "testnet")).toBe("unsupported");
    expect(walletNetworkStatus({ kind: "unavailable", label: "" }, "testnet")).toBe("unavailable");
  });
});

describe("watchFreighterNetwork", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reacts to Freighter network changes without reloading", async () => {
    let reportedNetwork = "TESTNET";
    const api: FreighterApiShape = { getNetwork: vi.fn(async () => reportedNetwork) };
    const onChange = vi.fn();

    watchFreighterNetwork(() => api, onChange, 3000);

    await vi.advanceTimersByTimeAsync(0);
    expect(onChange.mock.calls[0][0]).toEqual({ kind: "testnet", label: "testnet" });

    reportedNetwork = "PUBLIC";
    await vi.advanceTimersByTimeAsync(3000);
    expect(onChange.mock.calls[1][0]).toEqual({ kind: "mainnet", label: "mainnet" });
  });

  it("reports matching and mismatching states against the app network", async () => {
    const api: FreighterApiShape = { getNetwork: vi.fn(async () => "TESTNET") };
    const onChange = vi.fn();

    watchFreighterNetwork(() => api, onChange, 3000);

    await vi.advanceTimersByTimeAsync(0);
    const result = onChange.mock.calls[0][0];

    expect(walletNetworkStatus(result, "testnet")).toBe("match");
    expect(walletNetworkStatus(result, "mainnet")).toBe("mismatch");
  });

  it("produces a safe unsupported state for unknown networks", async () => {
    const api: FreighterApiShape = { getNetwork: vi.fn(async () => "FUTURENET") };
    const onChange = vi.fn();

    watchFreighterNetwork(() => api, onChange, 3000);

    await vi.advanceTimersByTimeAsync(0);
    const result = onChange.mock.calls[0][0];

    expect(result.kind).toBe("unsupported");
    expect(walletNetworkStatus(result, "testnet")).toBe("unsupported");
  });

  it("keeps the extension missing state safe when getNetwork is absent", async () => {
    const onChange = vi.fn();

    watchFreighterNetwork(() => ({}), onChange, 3000);

    await vi.advanceTimersByTimeAsync(0);
    expect(onChange.mock.calls[0][0]).toEqual({ kind: "unavailable", label: "" });
    expect(walletNetworkStatus(onChange.mock.calls[0][0], "testnet")).toBe("unavailable");
  });

  it("stops delivering results after cleanup", async () => {
    let reportedNetwork = "TESTNET";
    const api: FreighterApiShape = { getNetwork: vi.fn(async () => reportedNetwork) };
    const onChange = vi.fn();

    const stopWatching = watchFreighterNetwork(() => api, onChange, 3000);

    await vi.advanceTimersByTimeAsync(0);
    expect(onChange).toHaveBeenCalledTimes(1);

    stopWatching();

    reportedNetwork = "PUBLIC";
    await vi.advanceTimersByTimeAsync(9000);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
