import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { LiquidityPoolInspectorPanel } from "@/features/liquidity-pool-inspector/components/LiquidityPoolInspectorPanel";

describe("LiquidityPoolInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<LiquidityPoolInspectorPanel />);
    await expectNoAxeViolations(container);
  });
});
