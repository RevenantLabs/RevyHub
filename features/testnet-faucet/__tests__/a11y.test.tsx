import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { TestnetFaucetPanel } from "@/features/testnet-faucet/components/TestnetFaucetPanel";
import { copy } from "@/features/testnet-faucet/copy";
import { handlers } from "@/features/testnet-faucet/msw/handlers";
import { newAccountId } from "@/features/testnet-faucet/fixtures/testnetFaucet.fixture";

withMswHandlers(...handlers);

describe("TestnetFaucetPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TestnetFaucetPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations after a successful funding", async () => {
    const { container, user } = renderFeature(<TestnetFaucetPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), newAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.successTitle);

    await expectNoAxeViolations(container);
  });
});
