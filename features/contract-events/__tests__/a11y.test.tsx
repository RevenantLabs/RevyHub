import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { ContractEventsPanel } from "@/features/contract-events/components/ContractEventsPanel";
import { copy } from "@/features/contract-events/copy";
import { handlers } from "@/features/contract-events/msw/handlers";
import {
  contractId,
  endLedger,
  startLedger
} from "@/features/contract-events/fixtures/contractEvents.fixture";

withMswHandlers(...handlers);

describe("ContractEventsPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<ContractEventsPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a rendered events table", async () => {
    const { container, user } = renderFeature(<ContractEventsPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), contractId);
    await user.type(screen.getByLabelText(copy.startLedgerLabel), String(startLedger));
    await user.type(screen.getByLabelText(copy.endLedgerLabel), String(endLedger));
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());

    await expectNoAxeViolations(container);
  });
});
