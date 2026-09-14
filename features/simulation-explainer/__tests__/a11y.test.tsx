import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { SimulationExplainerPanel } from "@/features/simulation-explainer/components/SimulationExplainerPanel";
import { copy } from "@/features/simulation-explainer/copy";
import { handlers } from "@/features/simulation-explainer/msw/handlers";
import { validTransactionXdr } from "@/features/simulation-explainer/fixtures/simulationExplainer.fixture";

withMswHandlers(...handlers);

describe("SimulationExplainerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<SimulationExplainerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a rendered simulation result", async () => {
    const { container, user } = renderFeature(<SimulationExplainerPanel />);

    await user.click(screen.getByLabelText(copy.formLabel));
    await user.paste(validTransactionXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await waitFor(() => expect(screen.getByText(copy.resultTitle)).toBeInTheDocument());

    await expectNoAxeViolations(container);
  });
});
