import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { RegulatedAssetInspectorPanel } from "@/features/regulated-asset-inspector/components/RegulatedAssetInspectorPanel";
import { copy } from "@/features/regulated-asset-inspector/copy";
import { handlers } from "@/features/regulated-asset-inspector/msw/handlers";
import { issuerId } from "@/features/regulated-asset-inspector/fixtures/regulatedAssetInspector.fixture";

withMswHandlers(...handlers);

describe("RegulatedAssetInspectorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<RegulatedAssetInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<RegulatedAssetInspectorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows the self-published regulated result", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<RegulatedAssetInspectorPanel />);
    await user.type(screen.getByLabelText(copy.issuerLabel), issuerId);
    await user.type(screen.getByLabelText(copy.assetLabel), "USDC");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.selfPublishedTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.regulatedLabel)).toBeInTheDocument();
  });
});
