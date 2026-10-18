import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { TrustlineCheckerPanel } from "@/features/trustline-checker/components/TrustlineCheckerPanel";
import { copy } from "@/features/trustline-checker/copy";
import { handlers } from "@/features/trustline-checker/msw/handlers";
import {
  accountId,
  issuerId
} from "@/features/trustline-checker/fixtures/trustlineChecker.fixture";

withMswHandlers(...handlers);

describe("TrustlineCheckerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TrustlineCheckerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a field-level error shown", async () => {
    const { container, user } = renderFeature(<TrustlineCheckerPanel />);

    await user.type(screen.getByLabelText(copy.accountLabel), "nope");
    await user.type(screen.getByLabelText(copy.assetCodeLabel), "USDC");
    await user.type(screen.getByLabelText(copy.issuerLabel), issuerId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a result rendered", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<TrustlineCheckerPanel />);

    await user.type(screen.getByLabelText(copy.accountLabel), accountId);
    await user.type(screen.getByLabelText(copy.assetCodeLabel), "USDC");
    await user.type(screen.getByLabelText(copy.issuerLabel), issuerId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.foundTitle);

    await expectNoAxeViolations(container);
  });
});
