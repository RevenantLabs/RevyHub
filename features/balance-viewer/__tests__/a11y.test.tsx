import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { BalanceViewerPanel } from "@/features/balance-viewer/components/BalanceViewerPanel";
import { copy } from "@/features/balance-viewer/copy";
import { handlers } from "@/features/balance-viewer/msw/handlers";
import { accountId } from "@/features/balance-viewer/fixtures/balanceViewer.fixture";

withMswHandlers(...handlers);

describe("BalanceViewerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<BalanceViewerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a rendered balance table", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<BalanceViewerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());

    await expectNoAxeViolations(container);
  });
});
