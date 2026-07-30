import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NetworkProvider } from "@/components/stellar/NetworkProvider";
import FreighterConnectPage, {
  CLEAR_CONNECTION_MESSAGE
} from "@/app/tools/freighter-connect/page";

const PUBLIC_KEY = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ2";

function renderPage() {
  return render(
    <NetworkProvider>
      <FreighterConnectPage />
    </NetworkProvider>
  );
}

describe("FreighterConnectPage clear connection", () => {
  beforeEach(() => {
    Object.defineProperty(window, "freighterApi", {
      configurable: true,
      writable: true,
      value: {
        isConnected: vi.fn().mockResolvedValue(true),
        isAllowed: vi.fn().mockResolvedValue(true),
        getPublicKey: vi.fn().mockResolvedValue(PUBLIC_KEY),
        getNetwork: vi.fn().mockResolvedValue("TESTNET")
      }
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    delete window.freighterApi;
  });

  it("clears the displayed public key and wallet network without claiming to revoke Freighter permission", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Ask wallet mascot to connect" })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: "Ask wallet mascot to connect" }));

    await waitFor(() => {
      expect(screen.getByText(PUBLIC_KEY)).toBeInTheDocument();
    });
    expect(screen.getByText("Testnet")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear connection" }));

    expect(screen.queryByText(PUBLIC_KEY)).not.toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText(CLEAR_CONNECTION_MESSAGE)).toBeInTheDocument();
    expect(
      screen.getByText(/Freighter still manages extension permissions/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear connection" })).not.toBeInTheDocument();
  });

  it("allows reconnecting after a local clear", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Ask wallet mascot to connect" })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: "Ask wallet mascot to connect" }));
    await waitFor(() => {
      expect(screen.getByText(PUBLIC_KEY)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Clear connection" }));
    expect(screen.queryByText(PUBLIC_KEY)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ask wallet mascot to connect" }));
    await waitFor(() => {
      expect(screen.getByText(PUBLIC_KEY)).toBeInTheDocument();
    });
  });
});
