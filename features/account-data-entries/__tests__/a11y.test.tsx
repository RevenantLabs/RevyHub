import { describe, expect, it } from "vitest";
import { resetHorizonClients } from "@/core/horizon/client";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { AccountDataEntriesPanel } from "@/features/account-data-entries/components/AccountDataEntriesPanel";
import { copy } from "@/features/account-data-entries/copy";
import { handlers } from "@/features/account-data-entries/msw/handlers";
import { accountId } from "@/features/account-data-entries/fixtures/accountDataEntries.fixture";

withMswHandlers(...handlers);

describe("AccountDataEntriesPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AccountDataEntriesPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with decoded rows", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<AccountDataEntriesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());

    await expectNoAxeViolations(container);
  });
});
