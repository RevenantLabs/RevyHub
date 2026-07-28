import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TrustlineCheckerPage from "@/app/tools/trustline-checker/page";
import { NetworkProvider, useNetwork } from "@/components/stellar/NetworkProvider";
import * as trustlineLib from "@/lib/stellar/trustline";

vi.mock("@/lib/stellar/trustline", () => ({
  checkTrustline: vi.fn(),
}));

function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();
  return (
    <button onClick={() => setNetwork(network === "testnet" ? "mainnet" : "testnet")}>
      Switch Network
    </button>
  );
}

describe("TrustlineCheckerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears stale result message when network changes", async () => {
    vi.mocked(trustlineLib.checkTrustline).mockResolvedValueOnce({
      exists: true,
      message: "The trustline exists!"
    });

    render(
      <NetworkProvider>
        <TrustlineCheckerPage />
        <NetworkSwitcher />
      </NetworkProvider>
    );

    fireEvent.change(screen.getByLabelText("Account address"), { target: { value: "GA" } });
    fireEvent.submit(screen.getByRole("button", { name: "Inspect handshake" }));

    await waitFor(() => {
      expect(screen.getByText("The trustline exists!")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Switch Network" }));

    await waitFor(() => {
      expect(screen.queryByText("The trustline exists!")).not.toBeInTheDocument();
      expect(screen.getByText("Results were cleared because the selected Stellar network changed. Run the lookup again to fetch data for the current network.")).toBeInTheDocument();
    });
  });
});
