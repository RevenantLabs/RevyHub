import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { ResultCodeExplainerPanel } from "@/features/result-code-explainer/components/ResultCodeExplainerPanel";

describe("ResultCodeExplainerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<ResultCodeExplainerPanel />);
    await expectNoAxeViolations(container);
  });
});
