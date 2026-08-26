import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AssetStatisticsPanel } from "@/features/asset-statistics/components/AssetStatisticsPanel";

describe("AssetStatisticsPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AssetStatisticsPanel />);
    await expectNoAxeViolations(container);
  });
});
