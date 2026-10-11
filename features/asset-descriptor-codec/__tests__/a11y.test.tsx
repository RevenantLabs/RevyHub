import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AssetDescriptorCodecPanel } from "@/features/asset-descriptor-codec/components/AssetDescriptorCodecPanel";
import { copy } from "@/features/asset-descriptor-codec/copy";

describe("AssetDescriptorCodecPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AssetDescriptorCodecPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations once a result is shown", async () => {
    const { container, user } = renderFeature(<AssetDescriptorCodecPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), "XLM");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);

    await expectNoAxeViolations(container);
  });
});
