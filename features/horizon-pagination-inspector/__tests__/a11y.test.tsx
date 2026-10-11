import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { HorizonPaginationInspectorPanel } from "@/features/horizon-pagination-inspector/components/HorizonPaginationInspectorPanel";

describe("HorizonPaginationInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<HorizonPaginationInspectorPanel />);
    await expectNoAxeViolations(container);
  });
});
