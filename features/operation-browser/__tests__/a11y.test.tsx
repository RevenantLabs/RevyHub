import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { OperationBrowserPanel } from "@/features/operation-browser/components/OperationBrowserPanel";
import { copy } from "@/features/operation-browser/copy";
import { handlers } from "@/features/operation-browser/msw/handlers";
import { accountId } from "@/features/operation-browser/fixtures/operationBrowser.fixture";

withMswHandlers(...handlers);

describe("OperationBrowserPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<OperationBrowserPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations when results are shown", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<OperationBrowserPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("heading", { name: copy.resultTitle });
    await expectNoAxeViolations(container);
  }, 15_000);
});
