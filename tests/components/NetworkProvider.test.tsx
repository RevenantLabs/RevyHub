// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NetworkProvider, useNetwork } from "@/components/stellar/NetworkProvider";

const storageKey = "revyhubx-network";

function NetworkConsumer() {
  const { network, setNetwork } = useNetwork();

  return (
    <>
      <span role="status">{network}</span>
      <button type="button" onClick={() => setNetwork("mainnet")}>
        Use mainnet
      </button>
    </>
  );
}

function renderProvider() {
  return render(
    <NetworkProvider>
      <NetworkConsumer />
    </NetworkProvider>
  );
}

describe("NetworkProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("initializes to testnet when storage is empty", () => {
    renderProvider();

    expect(screen.getByRole("status").textContent).toBe("testnet");
    expect(window.localStorage.getItem(storageKey)).toBe("testnet");
  });

  it("restores a valid stored network", () => {
    window.localStorage.setItem(storageKey, "mainnet");

    renderProvider();

    expect(screen.getByRole("status").textContent).toBe("mainnet");
  });

  it("ignores an invalid stored network", () => {
    window.localStorage.setItem(storageKey, "futurenet");

    renderProvider();

    expect(screen.getByRole("status").textContent).toBe("testnet");
    expect(window.localStorage.getItem(storageKey)).toBe("testnet");
  });

  it("updates consumers and persistence when switching networks", () => {
    renderProvider();

    fireEvent.click(screen.getByRole("button", { name: "Use mainnet" }));

    expect(screen.getByRole("status").textContent).toBe("mainnet");
    expect(window.localStorage.getItem(storageKey)).toBe("mainnet");
  });

  it("falls back to testnet when reading browser storage fails", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage is blocked", "SecurityError");
    });

    expect(() => renderProvider()).not.toThrow();
    expect(screen.getByRole("status").textContent).toBe("testnet");
  });

  it("keeps switching consumers when writing browser storage fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage is blocked", "SecurityError");
    });

    renderProvider();

    expect(() => fireEvent.click(screen.getByRole("button", { name: "Use mainnet" }))).not.toThrow();
    expect(screen.getByRole("status").textContent).toBe("mainnet");
  });
});
