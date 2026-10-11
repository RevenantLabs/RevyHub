import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { AssetDescriptorCodecPanel } from "@/features/asset-descriptor-codec/components/AssetDescriptorCodecPanel";
import { copy, errorCopy } from "@/features/asset-descriptor-codec/copy";
import { validIssuer } from "@/features/asset-descriptor-codec/fixtures/assetDescriptor.fixture";

describe("AssetDescriptorCodecPanel", () => {
  it("shows the empty state before anything is converted", () => {
    renderFeature(<AssetDescriptorCodecPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("reports a successful conversion for native XLM", async () => {
    const { user } = renderFeature(<AssetDescriptorCodecPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), "XLM");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getAllByText("XLM").length).toBeGreaterThan(0);
  });

  it("reports a successful conversion for an issued asset", async () => {
    const { user } = renderFeature(<AssetDescriptorCodecPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), `USD:${validIssuer}`);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getAllByText(`USD:${validIssuer}`).length).toBeGreaterThan(0);
  });

  it("surfaces an error for an invalid issuer", async () => {
    const { user } = renderFeature(<AssetDescriptorCodecPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), "USD:not-a-valid-address");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(
      await screen.findByText(errorCopy.invalid_issuer.title)
    ).toBeInTheDocument();
  });

  it("prompts for input when submitted empty", async () => {
    const { user } = renderFeature(<AssetDescriptorCodecPanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(
      await screen.findByText(errorCopy.empty_input.title)
    ).toBeInTheDocument();
  });
});
