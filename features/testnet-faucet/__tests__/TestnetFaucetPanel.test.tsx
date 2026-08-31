import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { TestnetFaucetPanel } from "@/features/testnet-faucet/components/TestnetFaucetPanel";
import { copy, errorCopy } from "@/features/testnet-faucet/copy";
import { handlers } from "@/features/testnet-faucet/msw/handlers";
import {
  fundedAccountId,
  newAccountId
} from "@/features/testnet-faucet/fixtures/testnetFaucet.fixture";

withMswHandlers(...handlers);

describe("TestnetFaucetPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<TestnetFaucetPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("confirms a funded account and links to the explorer", async () => {
    const { user } = renderFeature(<TestnetFaucetPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), newAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.successTitle)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: copy.viewOnExplorer })).toHaveAttribute(
      "href",
      expect.stringContaining("testnet")
    );
  });

  it("explains that an existing account cannot be funded again", async () => {
    const { user } = renderFeature(<TestnetFaucetPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), fundedAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.already_funded.title)).toBeInTheDocument();
  });

  it("warns that the faucet stays on testnet when mainnet is selected", () => {
    renderFeature(<TestnetFaucetPanel />, { network: "mainnet" });
    expect(screen.getByText(copy.mainnetWarning)).toBeInTheDocument();
  });

  it("does not warn while testnet is selected", () => {
    renderFeature(<TestnetFaucetPanel />, { network: "testnet" });
    expect(screen.queryByText(copy.mainnetWarning)).not.toBeInTheDocument();
  });
});
