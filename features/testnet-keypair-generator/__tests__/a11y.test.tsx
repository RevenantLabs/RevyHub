import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { TestnetKeypairGeneratorPanel } from "@/features/testnet-keypair-generator/components/TestnetKeypairGeneratorPanel";
import { copy } from "@/features/testnet-keypair-generator/copy";
import { handlers } from "@/features/testnet-keypair-generator/msw/handlers";

withMswHandlers(...handlers);

describe("TestnetKeypairGeneratorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TestnetKeypairGeneratorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in its success/result state", async () => {
    const { container, user } = renderFeature(<TestnetKeypairGeneratorPanel />);

    const submitBtn = screen.getByRole("button", { name: copy.submit });
    await user.click(submitBtn);

    await screen.findByText(copy.resultTitle);
    await expectNoAxeViolations(container);
  });
});
