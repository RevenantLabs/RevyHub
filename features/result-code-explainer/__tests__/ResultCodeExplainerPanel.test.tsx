import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { ResultCodeExplainerPanel } from "@/features/result-code-explainer/components/ResultCodeExplainerPanel";
import { copy } from "@/features/result-code-explainer/copy";

describe("ResultCodeExplainerPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<ResultCodeExplainerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<ResultCodeExplainerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("explains a pasted code", async () => {
    const { user } = renderFeature(<ResultCodeExplainerPanel />);
    await user.type(screen.getByLabelText(copy.codeLabel), "payment_underfunded");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText("Payment source lacks balance")).toBeInTheDocument();
  });
});
