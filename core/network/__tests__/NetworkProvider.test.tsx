import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@/core/testing/render";
import { NETWORK_STORAGE_KEY, HORIZON_URLS, NETWORK_PASSPHRASES } from "@/core/network/config";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";

/**
 * Coverage for the network provider itself: what it reads at startup, what it
 * persists, and how it behaves when browser storage refuses to co-operate.
 *
 * Ported from the work in #194, which predates the move to
 * `core/network/NetworkProvider` and `useSyncExternalStore`. Two expectations
 * changed with that rewrite and are asserted in their new form below: the
 * provider no longer writes to storage merely because it mounted, and it now
 * follows the `storage` event so two open tabs agree.
 */

function NetworkConsumer() {
  const { network, setNetwork, horizonUrl, networkPassphrase } = useNetwork();

  return (
    <>
      <span role="status">{network}</span>
      <span data-testid="horizon">{horizonUrl}</span>
      <span data-testid="passphrase">{networkPassphrase}</span>
      <button type="button" onClick={() => setNetwork("mainnet")}>
        Use mainnet
      </button>
    </>
  );
}

function renderProvider(initialNetwork?: StellarNetwork) {
  return render(
    <NetworkProvider initialNetwork={initialNetwork}>
      <NetworkConsumer />
    </NetworkProvider>
  );
}

function currentNetwork() {
  return screen.getByRole("status").textContent;
}

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("NetworkProvider", () => {
  it("defaults to testnet when nothing is stored", () => {
    renderProvider();

    expect(currentNetwork()).toBe("testnet");
  });

  it("does not write to storage just because it mounted", () => {
    // Mounting is not a choice. Persisting one would overwrite a preference the
    // user has not made yet, and would write on every page load.
    renderProvider();

    expect(window.localStorage.getItem(NETWORK_STORAGE_KEY)).toBeNull();
  });

  it("restores a stored network", () => {
    window.localStorage.setItem(NETWORK_STORAGE_KEY, "mainnet");

    renderProvider();

    expect(currentNetwork()).toBe("mainnet");
  });

  it("ignores a stored value that is not a network", () => {
    window.localStorage.setItem(NETWORK_STORAGE_KEY, "futurenet");

    renderProvider();

    expect(currentNetwork()).toBe("testnet");
  });

  it("persists a switch and updates every consumer", () => {
    renderProvider();

    fireEvent.click(screen.getByRole("button", { name: "Use mainnet" }));

    expect(currentNetwork()).toBe("mainnet");
    expect(window.localStorage.getItem(NETWORK_STORAGE_KEY)).toBe("mainnet");
  });

  it("switches the endpoints and passphrase together with the network", () => {
    // A network that changed name but kept a testnet Horizon URL would be worse
    // than no switch at all.
    renderProvider();
    expect(screen.getByTestId("horizon").textContent).toBe(HORIZON_URLS.testnet);
    expect(screen.getByTestId("passphrase").textContent).toBe(NETWORK_PASSPHRASES.testnet);

    fireEvent.click(screen.getByRole("button", { name: "Use mainnet" }));

    expect(screen.getByTestId("horizon").textContent).toBe(HORIZON_URLS.mainnet);
    expect(screen.getByTestId("passphrase").textContent).toBe(NETWORK_PASSPHRASES.mainnet);
  });

  it("follows a change made in another tab", () => {
    renderProvider();
    expect(currentNetwork()).toBe("testnet");

    act(() => {
      window.localStorage.setItem(NETWORK_STORAGE_KEY, "mainnet");
      window.dispatchEvent(new StorageEvent("storage", { key: NETWORK_STORAGE_KEY }));
    });

    expect(currentNetwork()).toBe("mainnet");
  });

  it("honours an explicit initial network over what is stored", () => {
    window.localStorage.setItem(NETWORK_STORAGE_KEY, "mainnet");

    renderProvider("testnet");

    expect(currentNetwork()).toBe("testnet");
  });

  it("hands control back to the stored preference after an explicit switch", () => {
    renderProvider("testnet");

    fireEvent.click(screen.getByRole("button", { name: "Use mainnet" }));

    expect(currentNetwork()).toBe("mainnet");
  });

  it("falls back to testnet when reading storage throws", () => {
    // Private windows and blocked site data both throw on access rather than
    // returning null.
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage is blocked", "SecurityError");
    });

    expect(() => renderProvider()).not.toThrow();
    expect(currentNetwork()).toBe("testnet");
  });

  it("keeps the switch for this session when writing storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage is blocked", "SecurityError");
    });

    renderProvider();

    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "Use mainnet" }))
    ).not.toThrow();
    expect(currentNetwork()).toBe("mainnet");
  });

  it("refuses to be used outside a provider", () => {
    function Orphan() {
      useNetwork();
      return null;
    }

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(/must be used within a NetworkProvider/);
    consoleError.mockRestore();
  });
});
