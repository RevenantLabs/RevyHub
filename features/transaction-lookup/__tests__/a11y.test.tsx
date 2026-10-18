import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { TransactionLookupPanel } from "@/features/transaction-lookup/components/TransactionLookupPanel";
import { copy } from "@/features/transaction-lookup/copy";
import { handlers } from "@/features/transaction-lookup/msw/handlers";
import { successfulHash } from "@/features/transaction-lookup/fixtures/transactionLookup.fixture";

withMswHandlers(...handlers);

describe("TransactionLookupPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TransactionLookupPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a transaction and operation list", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<TransactionLookupPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), successfulHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.succeeded);

    await expectNoAxeViolations(container);
  });
});
