import { beforeEach, describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { LedgerLookupPanel } from "@/features/ledger-lookup/components/LedgerLookupPanel";
import { copy } from "@/features/ledger-lookup/copy";
import { handlers } from "@/features/ledger-lookup/msw/handlers";
import { sampleSequence } from "@/features/ledger-lookup/fixtures/ledgerLookup.fixture";

withMswHandlers(...handlers);

describe("LedgerLookupPanel accessibility", () => {
  beforeEach(() => {
    resetHorizonClients();
  });

  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<LedgerLookupPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations when showing a validation error", async () => {
    const { container, user } = renderFeature(<LedgerLookupPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations when showing a resolved ledger result", async () => {
    const { container, user } = renderFeature(<LedgerLookupPanel />);
    const input = screen.getByLabelText(copy.formLabel);
    await user.type(input, String(sampleSequence));
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => {
      expect(screen.getByText(copy.resultTitle)).toBeInTheDocument();
    });

    await expectNoAxeViolations(container);
  });
});
