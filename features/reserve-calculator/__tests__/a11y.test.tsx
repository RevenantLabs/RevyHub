import { describe, expect, it } from "vitest";
import { resetHorizonClients } from "@/core/horizon/client";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { ReserveCalculatorPanel } from "@/features/reserve-calculator/components/ReserveCalculatorPanel";
import { copy } from "@/features/reserve-calculator/copy";
import { handlers } from "@/features/reserve-calculator/msw/handlers";
import { accountId } from "@/features/reserve-calculator/fixtures/reserveCalculator.fixture";

withMswHandlers(...handlers);

describe("ReserveCalculatorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<ReserveCalculatorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a rendered calculation", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<ReserveCalculatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: copy.resultTitle })).toBeInTheDocument()
    );

    await expectNoAxeViolations(container);
  });
});
