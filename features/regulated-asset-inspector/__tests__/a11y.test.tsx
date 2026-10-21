import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { RegulatedAssetInspectorPanel } from "@/features/regulated-asset-inspector/components/RegulatedAssetInspectorPanel";
import { copy } from "@/features/regulated-asset-inspector/copy";
import { handlers } from "@/features/regulated-asset-inspector/msw/handlers";
import { issuerId } from "@/features/regulated-asset-inspector/fixtures/regulatedAssetInspector.fixture";

withMswHandlers(...handlers);

describe("RegulatedAssetInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<RegulatedAssetInspectorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations after a successful inspection", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<RegulatedAssetInspectorPanel />);
    await user.type(screen.getByLabelText(copy.issuerLabel), issuerId);
    await user.type(screen.getByLabelText(copy.assetLabel), "USDC");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);
    await expectNoAxeViolations(container);
  });
});
