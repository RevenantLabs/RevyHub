import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { BalanceList, type DisplayBalance } from "@/components/stellar/BalanceList";

describe("BalanceList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a valid liquidity pool share on mainnet", () => {
    const balances: DisplayBalance[] = [
      {
        assetCode: "Liquidity pool shares",
        assetType: "liquidity_pool_shares",
        poolId: "a43dc2c2c040d995c731eaee41872886a076735e5332f7a6fdf97cfb5e7d825c",
        amount: "100.0000000"
      }
    ];

    render(<BalanceList balances={balances} network="mainnet" />);

    // Shows asset code and amount
    expect(screen.getByText("Liquidity pool shares")).toBeDefined();
    expect(screen.getByText("100.0000000")).toBeDefined();

    // Verifies the CopyableValue renders the full ID in the title attribute
    const fullIdElement = screen.getByTitle("a43dc2c2c040d995c731eaee41872886a076735e5332f7a6fdf97cfb5e7d825c");
    expect(fullIdElement).toBeDefined();

    // Verifies the network explorer link
    const link = screen.getByTitle("View on Stellar Expert").closest("a");
    expect(link?.getAttribute("href")).toBe("https://stellar.expert/explorer/public/liquidity-pool/a43dc2c2c040d995c731eaee41872886a076735e5332f7a6fdf97cfb5e7d825c");
  });

  it("renders a valid liquidity pool share on testnet", () => {
    const balances: DisplayBalance[] = [
      {
        assetCode: "Liquidity pool shares",
        assetType: "liquidity_pool_shares",
        poolId: "b43dc2c2c040d995c731eaee41872886a076735e5332f7a6fdf97cfb5e7d825c",
        amount: "50.0000000"
      }
    ];

    render(<BalanceList balances={balances} network="testnet" />);

    // Verifies the network explorer link points to testnet
    const link = screen.getByTitle("View on Stellar Expert").closest("a");
    expect(link?.getAttribute("href")).toBe("https://stellar.expert/explorer/testnet/liquidity-pool/b43dc2c2c040d995c731eaee41872886a076735e5332f7a6fdf97cfb5e7d825c");
  });

  it("fails gracefully when poolId is missing or malformed", () => {
    const balances: DisplayBalance[] = [
      {
        assetCode: "Liquidity pool shares",
        assetType: "liquidity_pool_shares",
        poolId: "invalid-pool-id", // too short, not hex
        amount: "10.0000000"
      }
    ];

    render(<BalanceList balances={balances} network="testnet" />);

    // It should render "Invalid or missing pool ID" instead of the link/copyable
    expect(screen.getByText("Invalid or missing pool ID")).toBeDefined();
    
    // Ensure no link is rendered for stellar expert
    expect(screen.queryByTitle("View on Stellar Expert")).toBeNull();
  });
  
  it("renders ordinary issued assets", () => {
    const balances: DisplayBalance[] = [
      {
        assetCode: "USDC",
        assetType: "issued",
        issuer: "GBBD47IF6LWK7P7MDEVSCWT73IQIGCEYEEXI6W5QJ6A6K5X5M5QJ6A6K",
        amount: "10.5000000"
      }
    ];

    render(<BalanceList balances={balances} network="testnet" />);
    
    expect(screen.getByText("USDC")).toBeDefined();
    const fullIdElement = screen.getByTitle("GBBD47IF6LWK7P7MDEVSCWT73IQIGCEYEEXI6W5QJ6A6K5X5M5QJ6A6K");
    expect(fullIdElement).toBeDefined();
  });
});
