import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BalanceList, type DisplayBalance } from "../../components/stellar/BalanceList";

describe("BalanceList", () => {
  it("renders deterministic sections for native, credit, and liquidity-pool balances", () => {
    const balances: DisplayBalance[] = [
      { assetCode: "XLM", amount: "100.0000000", balanceType: "native" },
      {
        assetCode: "USDC",
        issuer: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        amount: "50.0000000",
        balanceType: "credit"
      },
      {
        assetCode: "AUSD",
        issuer: "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        amount: "25.0000000",
        balanceType: "credit"
      },
      {
        assetCode: "Liquidity pool shares",
        issuer: "pool-id",
        amount: "10.0000000",
        balanceType: "liquidity_pool"
      }
    ];

    const markup = renderToStaticMarkup(<BalanceList balances={balances} />);

    expect(markup).toContain("Native XLM");
    expect(markup).toContain("Credit assets");
    expect(markup).toContain("Liquidity pool shares");
    expect(markup).toContain("USDC");
    expect(markup).toContain("AUSD");
    expect(markup).toContain("pool-id");

    const nativeIndex = markup.indexOf("Native XLM");
    const creditIndex = markup.indexOf("Credit assets");
    const poolIndex = markup.indexOf("Liquidity pool shares");

    expect(nativeIndex).toBeLessThan(creditIndex);
    expect(creditIndex).toBeLessThan(poolIndex);
  });

  it("omits empty sections and returns no markup for an empty balance list", () => {
    const markup = renderToStaticMarkup(<BalanceList balances={[]} />);

    expect(markup).toBe("");
  });
});
