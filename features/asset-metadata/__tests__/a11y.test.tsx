import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { AssetMetadataPanel } from "@/features/asset-metadata/components/AssetMetadataPanel";
import { copy } from "@/features/asset-metadata/copy";
import { handlers } from "@/features/asset-metadata/msw/handlers";
import { DOMAIN } from "@/features/asset-metadata/fixtures/assetMetadata.fixture";

withMswHandlers(...handlers);

describe("AssetMetadataPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AssetMetadataPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with declared assets on screen", async () => {
    const { container, user } = renderFeature(<AssetMetadataPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), DOMAIN);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);

    await expectNoAxeViolations(container);
  });
});
