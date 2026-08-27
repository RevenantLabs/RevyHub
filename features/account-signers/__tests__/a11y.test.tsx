import { describe, it } from "vitest";
import { resetHorizonClients } from "@/core/horizon/client";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { AccountSignersPanel } from "@/features/account-signers/components/AccountSignersPanel";
import { copy } from "@/features/account-signers/copy";
import { handlers } from "@/features/account-signers/msw/handlers";
import { accountId } from "@/features/account-signers/fixtures/accountSigners.fixture";

withMswHandlers(...handlers);

describe("AccountSignersPanel accessibility", () => {
  it("has no WCAG 2.1 A/AA violations in the initial state", async () => {
    const { container } = renderFeature(<AccountSignersPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG 2.1 A/AA violations with signer and threshold results", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<AccountSignersPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("table", { name: copy.signerTableCaption(accountId) });
    await expectNoAxeViolations(container);
  });
});
