import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { AssetFlagsInspectorPanel } from "@/features/asset-flags-inspector/components/AssetFlagsInspectorPanel";
import { copy, errorCopy } from "@/features/asset-flags-inspector/copy";
import { handlers } from "@/features/asset-flags-inspector/msw/handlers";
import {
  issuerId,
  restrictedIssuerId,
  unknownIssuerId
} from "@/features/asset-flags-inspector/fixtures/assetFlagsInspector.fixture";

withMswHandlers(...handlers);

describe("AssetFlagsInspectorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<AssetFlagsInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<AssetFlagsInspectorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(errorCopy.empty_input.title)).toBeInTheDocument();
  });

  it("renders all four authorization flags for an issuer", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<AssetFlagsInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), issuerId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
    expect(screen.getByText("Authorization required")).toBeInTheDocument();
    expect(screen.getByText("Authorization revocable")).toBeInTheDocument();
    expect(screen.getByText("Clawback enabled")).toBeInTheDocument();
    expect(screen.getByText("Immutable authorization")).toBeInTheDocument();
  });

  it("calls out full issuer control for restricted issuers", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<AssetFlagsInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), restrictedIssuerId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(/full control/i)).toBeInTheDocument();
  });

  it("explains a missing account instead of a raw error", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<AssetFlagsInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unknownIssuerId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.account_not_found.title)).toBeInTheDocument();
  });
});
