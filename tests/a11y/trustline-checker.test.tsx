// @vitest-environment jsdom
import { Keypair } from "@stellar/stellar-sdk";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import TrustlineCheckerPage from "@/app/tools/trustline-checker/page";
import { axe } from "../utils/axe";
import { renderWithNetwork } from "../utils/render";

const { mockLoadAccount } = vi.hoisted(() => ({
  mockLoadAccount: vi.fn()
}));

vi.mock("@/lib/stellar/horizon", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/stellar/horizon")>();

  return {
    ...actual,
    getHorizonServer: vi.fn(() => ({
      loadAccount: mockLoadAccount
    }))
  };
});

describe("Trustline Checker a11y", () => {
  const account = Keypair.random().publicKey();
  const issuer = Keypair.random().publicKey();

  afterEach(() => {
    vi.clearAllMocks();
    mockLoadAccount.mockReset();
  });

  async function fillForm(user: ReturnType<typeof userEvent.setup>, accountValue: string) {
    await user.type(screen.getByLabelText("Account address"), accountValue);
    await user.type(screen.getByLabelText("Asset code"), "USDC");
    await user.type(screen.getByLabelText("Issuer address"), issuer);
    await user.click(screen.getByRole("button", { name: /inspect handshake/i }));
  }

  it("empty form state has no serious or critical axe violations", async () => {
    const { container } = renderWithNetwork(<TrustlineCheckerPage />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("validation error state has no serious or critical axe violations", async () => {
    const user = userEvent.setup();
    const { container } = renderWithNetwork(<TrustlineCheckerPage />);

    await fillForm(user, "not-a-stellar-account");

    await screen.findByText(/Account address:/i);
    expect(mockLoadAccount).not.toHaveBeenCalled();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("success result state has no serious or critical axe violations", async () => {
    mockLoadAccount.mockResolvedValue({
      balances: [
        {
          asset_type: "credit_alphanum4",
          asset_code: "USDC",
          asset_issuer: issuer,
          balance: "25.0000000",
          limit: "1000.0000000"
        }
      ]
    });

    const user = userEvent.setup();
    const { container } = renderWithNetwork(<TrustlineCheckerPage />);

    await fillForm(user, account);

    await screen.findByText(/Trustline found for USDC\./i);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("asynchronous error state has no serious or critical axe violations", async () => {
    mockLoadAccount.mockRejectedValue({ response: { status: 404 } });

    const user = userEvent.setup();
    const { container } = renderWithNetwork(<TrustlineCheckerPage />);

    await fillForm(user, account);

    await screen.findByText(/Account not found on Stellar testnet/i);
    await screen.findByRole("link", { name: /Open Testnet Faucet Helper/i });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
