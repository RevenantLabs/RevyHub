import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AssetFlagsInspectorPanel } from "@/features/asset-flags-inspector/components/AssetFlagsInspectorPanel";

describe("AssetFlagsInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AssetFlagsInspectorPanel />);
    await expectNoAxeViolations(container);
  });
});
