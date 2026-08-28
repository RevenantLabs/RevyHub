import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "jest-axe";
import { AssetStatisticsPanel } from "@/features/asset-statistics/components/AssetStatisticsPanel";
import { AssetStatisticsResult } from "@/features/asset-statistics/components/AssetStatisticsResult";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { fixtureResult } from "@/features/asset-statistics/fixtures/assetStatistics.fixture";

describe("AssetStatistics accessibility", () => {
  it("has no violations in initial state", async () => {
    const { container } = render(<AssetStatisticsPanel />, { wrapper: NetworkProvider });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no violations when showing results", async () => {
    const { container } = render(<AssetStatisticsResult result={fixtureResult} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
