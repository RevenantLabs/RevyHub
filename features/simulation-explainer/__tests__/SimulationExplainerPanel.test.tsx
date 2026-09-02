import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { SimulationExplainerPanel } from "@/features/simulation-explainer/components/SimulationExplainerPanel";
import { copy, errorCopy } from "@/features/simulation-explainer/copy";
import { handlers } from "@/features/simulation-explainer/msw/handlers";
import { validTransactionXdr } from "@/features/simulation-explainer/fixtures/simulationExplainer.fixture";

withMswHandlers(...handlers);

describe("SimulationExplainerPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<SimulationExplainerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<SimulationExplainerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("renders a successful simulation result", async () => {
    const { user } = renderFeature(<SimulationExplainerPanel />);

    await user.click(screen.getByLabelText(copy.formLabel));
    await user.paste(validTransactionXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => expect(screen.getByText(copy.resultTitle)).toBeInTheDocument());
    expect(screen.getByText(copy.resourcesTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.authTitle)).toBeInTheDocument();
  });

  it("shows a validation error for input that is not valid XDR", async () => {
    const { user } = renderFeature(<SimulationExplainerPanel />);

    await user.click(screen.getByLabelText(copy.formLabel));
    await user.paste("not-valid-xdr");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_xdr.title)).toBeInTheDocument();
  });
});
