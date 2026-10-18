import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { Sep10InspectorPanel } from "@/features/sep10-inspector/components/Sep10InspectorPanel";

describe("Sep10InspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<Sep10InspectorPanel />);
    await expectNoAxeViolations(container);
  });
});
