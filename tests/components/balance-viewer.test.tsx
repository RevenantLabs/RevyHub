import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BalanceViewerPage from "@/app/tools/balance-viewer/page";
import { NetworkProvider, useNetwork } from "@/components/stellar/NetworkProvider";
import * as accountLib from "@/lib/stellar/account";

vi.mock("@/lib/stellar/account", () => ({
  getAccountBalances: vi.fn(),
}));

function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();
  return (
    <button onClick={() => setNetwork(network === "testnet" ? "mainnet" : "testnet")}>
      Switch Network
    </button>
  );
}

describe("BalanceViewerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears stale results when network changes", async () => {
    vi.mocked(accountLib.getAccountBalances).mockResolvedValueOnce([
      { assetCode: "XLM", amount: "100.0000000" }
    ]);

    render(
      <NetworkProvider>
        <BalanceViewerPage />
        <NetworkSwitcher />
      </NetworkProvider>
    );

    fireEvent.change(screen.getByLabelText("Stellar public address"), { target: { value: "GA" } });
    fireEvent.submit(screen.getByRole("button", { name: "Open moon wallet" }));

    await waitFor(() => {
      expect(screen.getByText("100.0000000")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Switch Network" }));

    await waitFor(() => {
      expect(screen.queryByText("100.0000000")).not.toBeInTheDocument();
      expect(screen.getByText("Results were cleared because the selected Stellar network changed. Run the lookup again to fetch data for the current network.")).toBeInTheDocument();
    });
  });
});
