import "../mocks.tsx";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import BalanceViewerPage from "@/app/tools/balance-viewer/page";
import { NetworkProvider } from "@/components/stellar/NetworkProvider";

const mockGetAccountBalances = vi.fn();

vi.mock("@/lib/stellar/account", () => ({
  getAccountBalances: (...args: unknown[]) => mockGetAccountBalances(...args)
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<NetworkProvider>{ui}</NetworkProvider>);
}

describe("Balance Viewer tool", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("has no axe violations on empty form state", async () => {
    const { container } = renderWithProviders(<BalanceViewerPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations on success result state", async () => {
    mockGetAccountBalances.mockResolvedValue([
      { assetCode: "XLM", amount: "10000.1234567" },
      { assetCode: "USDC", amount: "500.00", issuer: "GABCISSUER12345678901234567890123456789012345678901234" }
    ]);

    const { container } = renderWithProviders(<BalanceViewerPage />);
    const input = screen.getByPlaceholderText("G...");
    await userEvent.type(input, "GAIUIZNW34OGCLZQJ3H6VCV6CR3B6FTUV4I7WONY5FY7B6YZU7P7HJHJ");
    await userEvent.click(screen.getByRole("button", { name: /open moon wallet/i }));

    await waitFor(() => {
      expect(screen.getByText("Wallet opened")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations on async error state", async () => {
    mockGetAccountBalances.mockRejectedValue(new Error("Account not found on Stellar testnet Horizon."));

    const { container } = renderWithProviders(<BalanceViewerPage />);
    const input = screen.getByPlaceholderText("G...");
    await userEvent.type(input, "GAIUIZNW34OGCLZQJ3H6VCV6CR3B6FTUV4I7WONY5FY7B6YZU7P7HJHJ");
    await userEvent.click(screen.getByRole("button", { name: /open moon wallet/i }));

    await waitFor(() => {
      expect(screen.getByText("Account not found on Stellar testnet Horizon.")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
