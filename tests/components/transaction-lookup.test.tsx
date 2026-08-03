import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TransactionLookupPage from "@/app/tools/transaction-lookup/page";
import { NetworkProvider, useNetwork } from "@/components/stellar/NetworkProvider";
import * as transactionLib from "@/lib/stellar/transaction";

vi.mock("@/lib/stellar/transaction", () => ({
  lookupTransaction: vi.fn(),
}));

function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();
  return (
    <button onClick={() => setNetwork(network === "testnet" ? "mainnet" : "testnet")}>
      Switch Network
    </button>
  );
}

describe("TransactionLookupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears stale transaction results when network changes", async () => {
    vi.mocked(transactionLib.lookupTransaction).mockResolvedValueOnce({
      hash: "a1b2c3d4",
      ledger: 1000,
      sourceAccount: "GA",
      feeCharged: "100",
      createdAt: "2026-01-01T00:00:00Z",
      successful: true,
      network: "testnet",
      operationCount: 1,
    });

    render(
      <NetworkProvider>
        <TransactionLookupPage />
        <NetworkSwitcher />
      </NetworkProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("64 character hash"), { target: { value: "a1b2c3d4" } });
    fireEvent.submit(screen.getByRole("button", { name: "Follow transaction trail" }));

    await waitFor(() => {
      expect(screen.getByText("Transaction result")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Switch Network" }));

    await waitFor(() => {
      expect(screen.queryByText("Transaction result")).not.toBeInTheDocument();
      expect(screen.getByText("Results were cleared because the selected Stellar network changed. Run the lookup again to fetch data for the current network.")).toBeInTheDocument();
    });
  });
});
