import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { ContractMetadataViewerPanel } from "@/features/contract-metadata-viewer/components/ContractMetadataViewerPanel";
import { ContractMetadataViewerResult } from "@/features/contract-metadata-viewer/components/ContractMetadataViewerResult";
import { contractMetadataViewerFixture } from "@/features/contract-metadata-viewer/fixtures/contractMetadataViewer.fixture";

describe("ContractMetadataViewerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<ContractMetadataViewerPanel />);
    await expectNoAxeViolations(container);
  });
  it("has no WCAG A/AA violations in its result state", async () => {
    const { container } = renderFeature(<ContractMetadataViewerResult result={contractMetadataViewerFixture} />);
    await expectNoAxeViolations(container);
  });
});
