import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { AssetDescriptorCodecPanel } from "@/features/asset-descriptor-codec/components/AssetDescriptorCodecPanel";
import { copy } from "@/features/asset-descriptor-codec/copy";
import {
  credit4Fixture,
  nativeFixture,
  secretSeed
} from "@/features/asset-descriptor-codec/fixtures/assetDescriptorCodec.fixture";

describe("AssetDescriptorCodecPanel", () => {
  it("renders the empty state on initial load", () => {
    renderFeature(<AssetDescriptorCodecPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.emptyDescription)).toBeInTheDocument();
  });

  it("encodes native asset descriptor and displays canonical result", async () => {
    const { user } = renderFeature(<AssetDescriptorCodecPanel />);

    const input = screen.getByLabelText(copy.inputLabel);
    await user.click(input);
    await user.paste("native");
    await user.click(screen.getByRole("button", { name: copy.submitEncode }));

    expect(await screen.findByText(copy.resultSummary)).toBeInTheDocument();
    expect(screen.getByText(nativeFixture.xdr)).toBeInTheDocument();
  });

  it("decodes credit asset XDR when switching to decode mode", async () => {
    const { user } = renderFeature(<AssetDescriptorCodecPanel />);

    await user.click(screen.getByRole("radio", { name: copy.modeDecode }));
    const input = screen.getByLabelText(copy.inputLabel);
    await user.click(input);
    await user.paste(credit4Fixture.xdr);
    await user.click(screen.getByRole("button", { name: copy.submitDecode }));

    expect(await screen.findByText(copy.resultSummary)).toBeInTheDocument();
    expect(screen.getByText(credit4Fixture.canonicalDescriptor)).toBeInTheDocument();
    expect(screen.getByText(credit4Fixture.issuer)).toBeInTheDocument();
  });

  it("never echoes or renders a secret seed anywhere in the component DOM", async () => {
    const { container, user } = renderFeature(<AssetDescriptorCodecPanel />);

    const input = screen.getByLabelText(copy.inputLabel);
    await user.click(input);
    await user.paste(`USDC:${secretSeed}`);
    await user.click(screen.getByRole("button", { name: copy.submitEncode }));

    await screen.findByText("Invalid asset issuer");
    expect(container.textContent).not.toContain(secretSeed);
  });

  it("clears result and restores empty state upon clicking reset", async () => {
    const { user } = renderFeature(<AssetDescriptorCodecPanel />);

    const input = screen.getByLabelText(copy.inputLabel);
    await user.click(input);
    await user.paste("native");
    await user.click(screen.getByRole("button", { name: copy.submitEncode }));

    await screen.findByText(copy.resultSummary);

    await user.click(screen.getByRole("button", { name: copy.resetButton }));
    expect(await screen.findByText(copy.emptyTitle)).toBeInTheDocument();
  });
});
