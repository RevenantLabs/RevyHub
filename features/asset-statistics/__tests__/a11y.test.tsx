import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { AssetStatisticsPanel } from "@/features/asset-statistics/components/AssetStatisticsPanel";
import { copy } from "@/features/asset-statistics/copy";
import { handlers } from "@/features/asset-statistics/msw/handlers";
import {
  assetCode,
  issuerId
} from "@/features/asset-statistics/fixtures/assetStatistics.fixture";

withMswHandlers(...handlers);

describe("AssetStatisticsPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AssetStatisticsPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with the statistics rendered", async () => {
    const { container, user } = renderFeature(<AssetStatisticsPanel />);

    await user.type(screen.getByLabelText(copy.assetCodeLabel), assetCode);
    await user.type(screen.getByLabelText(copy.issuerLabel), issuerId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.flagsTitle);

    await expectNoAxeViolations(container);
  });
});
