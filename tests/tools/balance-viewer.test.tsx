import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BalanceViewerPage from "../../app/tools/balance-viewer/page";

vi.mock("../../lib/stellar/account", () => ({
  getAccountBalances: vi.fn().mockResolvedValue([])
}));

vi.mock("../../components/stellar/NetworkProvider", () => ({
  useNetwork: () => ({ network: "testnet" })
}));

describe("BalanceViewerPage", () => {
  it("renders the balance viewer form", () => {
    render(<BalanceViewerPage />);
    expect(screen.getByText("Balance Viewer")).toBeDefined();
  });

  it("moves focus to result region after submission", async () => {
    const user = userEvent.setup();
    render(<BalanceViewerPage />);

    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find((b) => b.getAttribute("type") === "submit")!;
    expect(submitButton).toBeDefined();

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "GABCDEF1234567890");
    await user.click(submitButton);

    await waitFor(() => {
      expect(document.activeElement?.closest("[aria-live]")).toBeTruthy();
    });
  });

  it("supports repeated submissions", async () => {
    const user = userEvent.setup();
    render(<BalanceViewerPage />);

    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find((b) => b.getAttribute("type") === "submit")!;
    const inputs = screen.getAllByRole("textbox");

    await user.type(inputs[0], "GABCDEF1234567890");
    await user.click(submitButton);

    await waitFor(() => {
      expect(document.activeElement?.closest("[aria-live]")).toBeTruthy();
    });

    await user.clear(inputs[0]);
    await user.type(inputs[0], "G0987654321FEDCBA");
    await user.click(submitButton);

    await waitFor(() => {
      expect(document.activeElement?.closest("[aria-live]")).toBeTruthy();
    });
  });
});
