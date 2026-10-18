import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { FeeStatsPanel } from "@/features/fee-stats/components/FeeStatsPanel";
import { copy, congestionCopy } from "@/features/fee-stats/copy";
import { handlers } from "@/features/fee-stats/msw/handlers";

withMswHandlers(...handlers);

describe("FeeStatsPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<FeeStatsPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with both percentile tables rendered", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<FeeStatsPanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(congestionCopy.calm.title);

    await expectNoAxeViolations(container);
  });
});
