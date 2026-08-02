import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import {
  BalanceList,
  hasNonZeroLiabilities,
  allLiabilitiesZero,
  type DisplayBalance
} from "@/components/stellar/BalanceList";

function makeBalance(overrides: Partial<DisplayBalance> = {}): DisplayBalance {
  return {
    assetCode: "XLM",
    amount: "100.0000000",
    ...overrides,
  };
}

describe("hasNonZeroLiabilities", () => {
  it("returns true when buying liabilities are non-zero", () => {
    const balance = makeBalance({ buyingLiabilities: "5.0000000" });
    expect(hasNonZeroLiabilities(balance)).toBe(true);
  });

  it("returns true when selling liabilities are non-zero", () => {
    const balance = makeBalance({ sellingLiabilities: "3.0000000" });
    expect(hasNonZeroLiabilities(balance)).toBe(true);
  });

  it("returns false when both liabilities are undefined", () => {
    expect(hasNonZeroLiabilities(makeBalance())).toBe(false);
  });

  it("returns false when both liabilities are zero", () => {
    const balance = makeBalance({
      buyingLiabilities: "0.0000000",
      sellingLiabilities: "0.0000000",
    });
    expect(hasNonZeroLiabilities(balance)).toBe(false);
  });

  it("returns true when both liabilities are non-zero", () => {
    const balance = makeBalance({
      buyingLiabilities: "5.0000000",
      sellingLiabilities: "3.0000000",
    });
    expect(hasNonZeroLiabilities(balance)).toBe(true);
  });
});

describe("allLiabilitiesZero", () => {
  it("returns true when both are zero", () => {
    const balance = makeBalance({
      buyingLiabilities: "0.0000000",
      sellingLiabilities: "0.0000000",
    });
    expect(allLiabilitiesZero(balance)).toBe(true);
  });

  it("returns true when both are undefined", () => {
    expect(allLiabilitiesZero(makeBalance())).toBe(true);
  });

  it("returns false when buying is non-zero", () => {
    const balance = makeBalance({ buyingLiabilities: "5.0000000" });
    expect(allLiabilitiesZero(balance)).toBe(false);
  });

  it("returns false when selling is non-zero", () => {
    const balance = makeBalance({ sellingLiabilities: "3.0000000" });
    expect(allLiabilitiesZero(balance)).toBe(false);
  });
});

describe("BalanceList rendering", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the empty state when there are no balances", () => {
    render(<BalanceList balances={[]} />);

    expect(
      screen.getByText("This account has no balances. The moon wallet is empty.")
    ).toBeInTheDocument();
  });

  it("keeps liability values hidden on the default card", () => {
    render(
      <BalanceList
        balances={[
          makeBalance({ buyingLiabilities: "5.0000000", sellingLiabilities: "3.0000000" })
        ]}
      />
    );

    expect(screen.queryByText("Buying liabilities")).not.toBeInTheDocument();
    expect(screen.queryByText("Selling liabilities")).not.toBeInTheDocument();
  });

  it("reveals buying and selling liabilities when the card is expanded", async () => {
    const user = userEvent.setup();
    render(
      <BalanceList
        balances={[
          makeBalance({ buyingLiabilities: "5.0000000", sellingLiabilities: "3.0000000" })
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Show liabilities" }));

    expect(screen.getByText("Buying liabilities")).toBeInTheDocument();
    expect(screen.getByText("Selling liabilities")).toBeInTheDocument();
    expect(screen.getByText("5.0000000")).toBeInTheDocument();
    expect(screen.getByText("3.0000000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide liabilities" })).toBeInTheDocument();
  });

  it("shows a compact note instead of a reveal button when liabilities are zero", () => {
    render(
      <BalanceList
        balances={[
          makeBalance({ buyingLiabilities: "0.0000000", sellingLiabilities: "0.0000000" })
        ]}
      />
    );

    expect(screen.queryByRole("button", { name: /liabilities/i })).not.toBeInTheDocument();
    expect(screen.getByText("No outstanding liabilities")).toBeInTheDocument();
  });

  it("shows a compact note when Horizon provides no liabilities", () => {
    render(<BalanceList balances={[makeBalance()]} />);

    expect(screen.queryByRole("button", { name: /liabilities/i })).not.toBeInTheDocument();
    expect(screen.getByText("No outstanding liabilities")).toBeInTheDocument();
  });

  it("renders the native asset header for native balances", () => {
    render(<BalanceList balances={[makeBalance({ isNative: true })]} />);

    expect(screen.getByText("XLM — Native Asset")).toBeInTheDocument();
    expect(screen.getByText("100.0000000")).toBeInTheDocument();
  });

  it("renders the asset code and issuer for issued balances", () => {
    render(
      <BalanceList
        balances={[
          makeBalance({
            isNative: false,
            assetCode: "USDC",
            issuer: "GA5ZSEJYB37JRC5AVCKA5L5PJOSZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5"
          })
        ]}
      />
    );

    expect(screen.getByText("USDC")).toBeInTheDocument();
    expect(
      screen.getByTitle("GA5ZSEJYB37JRC5AVCKA5L5PJOSZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5")
    ).toBeInTheDocument();
  });

  it("renders the liquidity pool header for pool share balances", () => {
    render(
      <BalanceList
        balances={[
          makeBalance({
            isNative: false,
            assetCode: "Liquidity pool shares",
            issuer: "0000000000000000000000000000000000000000000000000000000000000000"
          })
        ]}
      />
    );

    expect(screen.getByText("Liquidity Pool Shares")).toBeInTheDocument();
  });
});
