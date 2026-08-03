import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NetworkProvider } from "@/components/stellar/NetworkProvider";
import BalanceViewerPage from "@/app/tools/balance-viewer/page";
import { downloadBlob } from "@/lib/export";
import { getAccountBalances } from "@/lib/stellar/account";
import type { DisplayBalance } from "@/components/stellar/BalanceList";

const PUBLIC_KEY = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ2";

const balances: DisplayBalance[] = [{ assetCode: "XLM", amount: "10000.0000000", isNative: true }];

vi.mock("@/lib/stellar/account", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/stellar/account")>();
  return { ...actual, getAccountBalances: vi.fn() };
});

vi.mock("@/lib/export", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/export")>();
  return { ...actual, downloadBlob: vi.fn() };
});

function renderPage() {
  return render(
    <NetworkProvider>
      <BalanceViewerPage />
    </NetworkProvider>
  );
}

async function performLookup(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Stellar public address"), PUBLIC_KEY);
  await user.click(screen.getByRole("button", { name: "Open moon wallet" }));
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Export as JSON" })).toBeInTheDocument();
  });
}

describe("BalanceViewerPage export as JSON", () => {
  beforeEach(() => {
    vi.mocked(getAccountBalances).mockResolvedValue(balances);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("does not show the Export as JSON button before a successful lookup", () => {
    renderPage();
    expect(screen.queryByRole("button", { name: "Export as JSON" })).not.toBeInTheDocument();
  });

  it("shows the Export as JSON button after a successful lookup and downloads a snapshot on click", async () => {
    const user = userEvent.setup();
    renderPage();

    await performLookup(user);
    await user.click(screen.getByRole("button", { name: "Export as JSON" }));

    expect(downloadBlob).toHaveBeenCalledTimes(1);
    const [blob, filename] = vi.mocked(downloadBlob).mock.calls[0];
    expect(blob.type).toBe("application/json");
    expect(filename).toMatch(/^revyhubx-balances-testnet-GABCDEFG-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it("still shows Export as JSON after a successful lookup that returns no balances", async () => {
    vi.mocked(getAccountBalances).mockResolvedValueOnce([]);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Stellar public address"), PUBLIC_KEY);
    await user.click(screen.getByRole("button", { name: "Open moon wallet" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Export as JSON" })).toBeInTheDocument();
    });
    expect(screen.getByText(/This account has no balances/i)).toBeInTheDocument();
  });

  it("hides the Export as JSON button when a subsequent lookup fails", async () => {
    const user = userEvent.setup();
    renderPage();

    await performLookup(user);

    vi.mocked(getAccountBalances).mockRejectedValueOnce(new Error("Account not found"));
    await user.click(screen.getByRole("button", { name: "Open moon wallet" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Export as JSON" })).not.toBeInTheDocument();
    });
  });
});
