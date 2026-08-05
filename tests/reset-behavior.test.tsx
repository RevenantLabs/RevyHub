import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { DisplayBalance } from "@/components/stellar/BalanceList";
import type { TransactionSummary } from "@/components/stellar/TransactionDetails";
import BalanceViewerPage from "@/app/tools/balance-viewer/page";
import TransactionLookupPage from "@/app/tools/transaction-lookup/page";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

// Mock the Stellar SDK network details used by useNetwork
vi.mock("@/components/stellar/NetworkProvider", () => ({
  useNetwork: () => ({ network: "testnet" }),
}));

// Mock the Horizon-dependent utility modules
vi.mock("@/lib/stellar/account", () => ({
  getAccountBalances: vi.fn(),
}));

vi.mock("@/lib/stellar/transaction", () => ({
  lookupTransaction: vi.fn(),
}));

vi.mock("@/lib/stellar/trustline", () => ({
  checkTrustline: vi.fn(),
}));

vi.mock("qrcode", () => ({
  default: { toDataURL: vi.fn() },
}));

vi.mock("@/lib/copy", () => ({
  copyText: vi.fn(),
}));

// Import the mocked modules so we can control their return values
import { getAccountBalances } from "@/lib/stellar/account";
import { lookupTransaction } from "@/lib/stellar/transaction";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/* ------------------------------------------------------------------ */
/*  BalanceViewerPage reset tests                                      */
/* ------------------------------------------------------------------ */

describe("BalanceViewerPage — reset behavior", () => {
  it("renders a Reset button next to the submit button", () => {
    render(<BalanceViewerPage />);

    const resetButton = screen.getByRole("button", { name: /reset/i });
    expect(resetButton).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /open moon wallet/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("restores focus to the first input after reset", () => {
    render(<BalanceViewerPage />);

    const addressInput = screen.getByPlaceholderText("G...");
    fireEvent.change(addressInput, {
      target: { value: "GCXKG6RN4ON6YJWUCYG6J6Y6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6" },
    });
    addressInput.focus();

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    expect(document.activeElement).toBe(addressInput);
  });

  it("clears address input, result, status, and loading state on reset", async () => {
    const mockBalances: DisplayBalance[] = [
      { assetCode: "XLM", amount: "100.0000000" },
    ];

    vi.mocked(getAccountBalances).mockResolvedValue(mockBalances);

    render(<BalanceViewerPage />);

    // Type an address into the input
    const addressInput = screen.getByPlaceholderText("G...");
    fireEvent.change(addressInput, {
      target: { value: "GCXKG6RN4ON6YJWUCYG6J6Y6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6" },
    });

    // Submit the form to trigger a result
    fireEvent.click(screen.getByRole("button", { name: /open moon wallet/i }));

    // Wait for the success state to appear
    const balanceEntry = await screen.findByText("100.0000000");
    expect(balanceEntry).toBeInTheDocument();

    // Click Reset
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    // Input should be cleared
    expect(addressInput).toHaveValue("");

    // Balances should be cleared
    expect(screen.queryByText("100.0000000")).not.toBeInTheDocument();

    // Status should be back to info
    expect(screen.getByText(/moon wallet is waiting/i)).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  TransactionLookupPage reset tests                                  */
/* ------------------------------------------------------------------ */

describe("TransactionLookupPage — reset behavior", () => {
  it("renders a Reset button next to the submit button", () => {
    render(<TransactionLookupPage />);

    const resetButton = screen.getByRole("button", { name: /reset/i });
    expect(resetButton).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /follow transaction trail/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("restores focus to the hash input after reset", () => {
    render(<TransactionLookupPage />);

    const hashInput = screen.getByPlaceholderText("64 character hash");
    fireEvent.change(hashInput, {
      target: { value: "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789" },
    });
    hashInput.focus();

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    expect(document.activeElement).toBe(hashInput);
  });

  it("clears hash input, transaction details, and status on reset", async () => {
    const mockTransaction: TransactionSummary = {
      hash: "abc123",
      ledger: 12345,
      sourceAccount: "GCXKG6RN4ON6YJWUCYG6J6Y6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6",
      feeCharged: "100",
      operationCount: 1,
      createdAt: "2024-01-01T00:00:00Z",
      successful: true,
      network: "testnet",
    };

    vi.mocked(lookupTransaction).mockResolvedValue(mockTransaction);

    render(<TransactionLookupPage />);

    // Type a hash into the input
    const hashInput = screen.getByPlaceholderText("64 character hash");
    fireEvent.change(hashInput, {
      target: { value: "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /follow transaction trail/i }));

    // Wait for the transaction details to appear - look for the successful badge text
    const successBadge = await screen.findByText("Successful");
    expect(successBadge).toBeInTheDocument();

    // Click Reset
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    // Input should be cleared
    expect(hashInput).toHaveValue("");

    // Transaction details should be gone (the Successful badge should disappear)
    expect(screen.queryByText("Successful")).not.toBeInTheDocument();

    // Status should be back to info
    expect(screen.getByText(/detective comet needs/i)).toBeInTheDocument();
  });
});
