import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { AssetFlagsInspectorPanel } from "@/features/asset-flags-inspector/components/AssetFlagsInspectorPanel";
import { copy } from "@/features/asset-flags-inspector/copy";

describe("AssetFlagsInspectorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<AssetFlagsInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<AssetFlagsInspectorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
