import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { HorizonUrlBuilderPanel } from "@/features/horizon-url-builder/components/HorizonUrlBuilderPanel";

describe("HorizonUrlBuilderPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<HorizonUrlBuilderPanel />);
    await expectNoAxeViolations(container);
  });
});
