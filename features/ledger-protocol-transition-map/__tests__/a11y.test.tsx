import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { LedgerProtocolTransitionMapPanel } from "@/features/ledger-protocol-transition-map/components/LedgerProtocolTransitionMapPanel";
import { copy } from "@/features/ledger-protocol-transition-map/copy";
import { handlers } from "@/features/ledger-protocol-transition-map/msw/handlers";

withMswHandlers(...handlers);

describe("LedgerProtocolTransitionMapPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<LedgerProtocolTransitionMapPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations after a successful scan", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<LedgerProtocolTransitionMapPanel />, {
      network: "testnet"
    });

    await user.clear(screen.getByLabelText(copy.startLabel));
    await user.type(screen.getByLabelText(copy.startLabel), "1000");
    await user.clear(screen.getByLabelText(copy.countLabel));
    await user.type(screen.getByLabelText(copy.countLabel), "4");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.runsTitle);

    await expectNoAxeViolations(container);
  });
});
