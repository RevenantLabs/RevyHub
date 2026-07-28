import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TestnetFaucetPage from "../../app/tools/testnet-faucet/page";

vi.mock("../../lib/stellar/friendbot", () => ({
  fundTestnetAccount: vi.fn().mockResolvedValue(undefined)
}));

describe("TestnetFaucetPage", () => {
  it("renders the faucet form", () => {
    render(<TestnetFaucetPage />);
    expect(screen.getByText("Testnet Faucet Helper")).toBeDefined();
  });

  it("moves focus to result region after submission", async () => {
    const user = userEvent.setup();
    render(<TestnetFaucetPage />);

    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find((b) => b.tagName === "BUTTON" && b.getAttribute("type") === "submit")!;
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
    render(<TestnetFaucetPage />);

    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find((b) => b.tagName === "BUTTON" && b.getAttribute("type") === "submit")!;
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
