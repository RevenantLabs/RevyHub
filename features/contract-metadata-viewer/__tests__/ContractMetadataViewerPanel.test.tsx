import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { ContractMetadataViewerPanel } from "@/features/contract-metadata-viewer/components/ContractMetadataViewerPanel";
import { copy } from "@/features/contract-metadata-viewer/copy";

describe("ContractMetadataViewerPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<ContractMetadataViewerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<ContractMetadataViewerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
