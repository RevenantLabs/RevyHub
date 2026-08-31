import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { Sep10InspectorPanel } from "@/features/sep10-inspector/components/Sep10InspectorPanel";
import { copy } from "@/features/sep10-inspector/copy";

describe("Sep10InspectorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<Sep10InspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<Sep10InspectorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
