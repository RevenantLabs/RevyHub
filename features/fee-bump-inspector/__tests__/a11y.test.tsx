import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { FeeBumpInspectorPanel } from "@/features/fee-bump-inspector/components/FeeBumpInspectorPanel";
import { copy } from "@/features/fee-bump-inspector/copy";
import {
  feeBumpXdr,
  ordinaryXdr
} from "@/features/fee-bump-inspector/fixtures/feeBumpInspector.fixture";

describe("FeeBumpInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<FeeBumpInspectorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with both layers on screen", async () => {
    const { container, user } = renderFeature(<FeeBumpInspectorPanel />);

    await user.click(screen.getByLabelText(copy.envelopeLabel));
    await user.paste(feeBumpXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.outerTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while showing the wrong-envelope notice", async () => {
    const { container, user } = renderFeature(<FeeBumpInspectorPanel />);

    await user.click(screen.getByLabelText(copy.envelopeLabel));
    await user.paste(ordinaryXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("status");

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with the custom passphrase field revealed", async () => {
    const { container, user } = renderFeature(<FeeBumpInspectorPanel />);

    await user.selectOptions(screen.getByLabelText(copy.networkLabel), "custom");
    await screen.findByLabelText(copy.customNetworkLabel);

    await expectNoAxeViolations(container);
  });
});
