import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FreighterConnectPage from "@/app/tools/freighter-connect/page";
import { NetworkProvider } from "@/components/stellar/NetworkProvider";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Install a mock Freighter API on `window.freighterApi`.
 * Pass `null` to simulate an absent extension.
 */
function mockFreighterApi(api: Partial<Window["freighterApi"]> | null) {
  if (api === null) {
    delete (window as unknown as Record<string, unknown>).freighterApi;
  } else {
    (window as unknown as Record<string, unknown>).freighterApi = api;
  }
}

/** Render the page wrapped in NetworkProvider (app defaults to testnet). */
function renderPage() {
  return render(
    <NetworkProvider>
      <FreighterConnectPage />
    </NetworkProvider>
  );
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("FreighterConnectPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage so each test starts with the default testnet.
    window.localStorage.clear();
    // Wipe freighterApi so tests start clean.
    delete (window as unknown as Record<string, unknown>).freighterApi;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------------------
  // Extension availability
  // -----------------------------------------------------------------------

  describe("extension availability", () => {
    it("shows 'Not detected' and a warning message when the extension is missing", async () => {
      mockFreighterApi(null);

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Not detected")).toBeInTheDocument();
      });

      // The status message should warn the user.
      expect(screen.getByText("Wallet mascot status")).toBeInTheDocument();
      expect(
        screen.getByText(/could not find Freighter/i)
      ).toBeInTheDocument();
    });

    it("shows 'Detected' and an info message when the extension is available but not yet allowed", async () => {
      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(false),
        isAllowed: vi.fn().mockResolvedValue(false),
        getNetwork: vi.fn().mockResolvedValue("TESTNET")
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Detected")).toBeInTheDocument();
      });

      expect(screen.getByText("Not allowed")).toBeInTheDocument();
      expect(
        screen.getByText(/spotted Freighter/i)
      ).toBeInTheDocument();
    });

    it("auto-detects connection when the extension reports it is already allowed", async () => {
      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(true),
        isAllowed: vi.fn().mockResolvedValue(true),
        getNetwork: vi.fn().mockResolvedValue("PUBLIC")
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Allowed")).toBeInTheDocument();
      });

      expect(
        screen.getByText(/already allowed/i)
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Connection flow
  // -----------------------------------------------------------------------

  describe("connection flow", () => {
    it("renders the public key and label after the user approves the connection", async () => {
      const testKey =
        "GDEVNJI43MWMOBWPR4IO5XETMIZTYLFHL6QJCLWIH26YFPXE7NGAUCRS";

      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(false),
        isAllowed: vi.fn().mockResolvedValue(false),
        getPublicKey: vi.fn().mockResolvedValue(testKey),
        getNetwork: vi.fn().mockResolvedValue("TESTNET")
      });

      renderPage();

      // Wait for initial detection.
      await waitFor(() => {
        expect(screen.getByText("Detected")).toBeInTheDocument();
      });

      // Click the connect button.
      const user = userEvent.setup();
      await user.click(
        screen.getByRole("button", { name: /ask wallet mascot to connect/i })
      );

      await waitFor(() => {
        expect(screen.getByText(testKey)).toBeInTheDocument();
      });

      // Verify the key label also appears.
      expect(
        screen.getByText("Connected public key")
      ).toBeInTheDocument();

      expect(
        screen.getByText(/received the Freighter public key/i)
      ).toBeInTheDocument();
    });

    it("displays an error message when the user rejects the connection", async () => {
      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(false),
        isAllowed: vi.fn().mockResolvedValue(false),
        getPublicKey: vi.fn().mockRejectedValue(new Error("User rejected")),
        getNetwork: vi.fn().mockResolvedValue("TESTNET")
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Detected")).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(
        screen.getByRole("button", { name: /ask wallet mascot to connect/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/rejected or could not be completed/i)
        ).toBeInTheDocument();
      });
    });

    it("the connect button is enabled when Freighter is detected", async () => {
      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(false),
        isAllowed: vi.fn().mockResolvedValue(false),
        getNetwork: vi.fn().mockResolvedValue("TESTNET")
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Detected")).toBeInTheDocument();
      });

      const button = screen.getByRole("button", {
        name: /ask wallet mascot to connect/i
      });

      expect(button).toBeEnabled();
    });

    it("the connect button is disabled when Freighter is not available", async () => {
      mockFreighterApi(null);

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Not detected")).toBeInTheDocument();
      });

      const button = screen.getByRole("button", {
        name: /ask wallet mascot to connect/i
      });

      // The button should be disabled when Freighter is missing.
      expect(button).toBeDisabled();
    });

    it("falls back gracefully when getNetwork is not available on the API", async () => {
      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(false),
        isAllowed: vi.fn().mockResolvedValue(false)
        // NOTE: getNetwork intentionally omitted.
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Detected")).toBeInTheDocument();
      });

      // The wallet-network badge should fall back to "Unknown".
      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Wallet network rendering
  // -----------------------------------------------------------------------

  describe("wallet network rendering", () => {
    it("displays the raw wallet network value when reported by Freighter", async () => {
      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(false),
        isAllowed: vi.fn().mockResolvedValue(false),
        getNetwork: vi.fn().mockResolvedValue("TESTNET")
      });

      renderPage();

      await waitFor(() => {
        // The raw value "TESTNET" should appear in the Wallet network badge.
        expect(screen.getByText("TESTNET")).toBeInTheDocument();
      });
    });

    it("shows 'Unknown' when the wallet network is an empty string", async () => {
      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(false),
        isAllowed: vi.fn().mockResolvedValue(false),
        getNetwork: vi.fn().mockResolvedValue("")
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Unknown")).toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // App-versus-wallet network mismatch
  // -----------------------------------------------------------------------

  describe("network mismatch", () => {
    it("does not show a mismatch warning when app and wallet are both testnet", async () => {
      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(false),
        isAllowed: vi.fn().mockResolvedValue(false),
        getNetwork: vi.fn().mockResolvedValue("TESTNET")
      });

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(/Freighter reports TESTNET/i)
        ).toBeInTheDocument();
      });

      // The mismatch banner should NOT be visible.
      expect(
        screen.queryByText(/Network mismatch/i)
      ).not.toBeInTheDocument();
    });

    it("shows a network-mismatch warning when the wallet is on mainnet and the app is testnet", async () => {
      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(false),
        isAllowed: vi.fn().mockResolvedValue(false),
        getNetwork: vi.fn().mockResolvedValue("PUBLIC") // mainnet
      });

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(/Network mismatch/i)
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Freighter reports PUBLIC/i)
      ).toBeInTheDocument();
    });

    it("shows a mismatch warning when Freighter reports a test-like network but the app is mainnet", async () => {
      // Simulate the app being switched to mainnet via localStorage.
      window.localStorage.setItem("revyhubx-network", "mainnet");

      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(false),
        isAllowed: vi.fn().mockResolvedValue(false),
        getNetwork: vi.fn().mockResolvedValue("Test SDF Network ; September 2015")
      });

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(/Network mismatch/i)
        ).toBeInTheDocument();
      });
    });

    it("does not show a mismatch warning for unrecognized wallet network values", async () => {
      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(false),
        isAllowed: vi.fn().mockResolvedValue(false),
        getNetwork: vi.fn().mockResolvedValue("future-network")
      });

      renderPage();

      await waitFor(() => {
        // Should NOT show mismatch for unknown networks.
        expect(
          screen.queryByText(/Network mismatch/i)
        ).not.toBeInTheDocument();
      });

      // The info panel should still appear.
      expect(
        screen.getByText(/Network check/i)
      ).toBeInTheDocument();
    });
  });



  // -----------------------------------------------------------------------
  // Status messages — verify each distinct state renders correctly
  // -----------------------------------------------------------------------

  describe("status messages", () => {
    it("renders the initial 'listening' info message on first mount with no extension", async () => {
      mockFreighterApi(null);

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(/could not find Freighter/i)
        ).toBeInTheDocument();
      });
    });

    it("renders the 'spotted Freighter' info message when extension is present but not allowed", async () => {
      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(false),
        isAllowed: vi.fn().mockResolvedValue(false),
        getNetwork: vi.fn().mockResolvedValue("TESTNET")
      });

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(/spotted Freighter/i)
        ).toBeInTheDocument();
      });
    });

    it("renders the 'already allowed' success message when the extension auto-reports permission", async () => {
      mockFreighterApi({
        isConnected: vi.fn().mockResolvedValue(true),
        isAllowed: vi.fn().mockResolvedValue(true),
        getNetwork: vi.fn().mockResolvedValue("TESTNET")
      });

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(/already allowed/i)
        ).toBeInTheDocument();
      });
    });
  });
});
