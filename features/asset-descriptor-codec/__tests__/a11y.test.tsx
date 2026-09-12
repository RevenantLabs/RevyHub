import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AssetDescriptorCodecPanel } from "@/features/asset-descriptor-codec/components/AssetDescriptorCodecPanel";
import { copy } from "@/features/asset-descriptor-codec/copy";

describe("AssetDescriptorCodecPanel accessibility", () => {
  it("has no WCAG A/AA violations in its idle empty state", async () => {
    const { container } = renderFeature(<AssetDescriptorCodecPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in its success state", async () => {
    const { container, user } = renderFeature(<AssetDescriptorCodecPanel />);

    const input = screen.getByLabelText(copy.inputLabel);
    await user.click(input);
    await user.paste("native");
    await user.click(screen.getByRole("button", { name: copy.submitEncode }));

    await screen.findByText(copy.resultSummary);
    await expectNoAxeViolations(container);
  });
});
