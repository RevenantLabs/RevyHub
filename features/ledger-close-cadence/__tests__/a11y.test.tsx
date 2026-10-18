import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { LedgerCloseCadencePanel } from "@/features/ledger-close-cadence/components/LedgerCloseCadencePanel";
import { copy } from "@/features/ledger-close-cadence/copy";
import { handlers } from "@/features/ledger-close-cadence/msw/handlers";

withMswHandlers(...handlers);

describe("LedgerCloseCadencePanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<LedgerCloseCadencePanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations after a successful measurement", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<LedgerCloseCadencePanel />, { network: "testnet" });

    await user.clear(screen.getByLabelText(copy.formLabel));
    await user.type(screen.getByLabelText(copy.formLabel), "4");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.summaryTitle);

    await expectNoAxeViolations(container);
  });
});
