import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { XdrInspectorPanel } from "@/features/xdr-inspector/components/XdrInspectorPanel";
import { copy } from "@/features/xdr-inspector/copy";
import { paymentXdr } from "@/features/xdr-inspector/fixtures/xdrInspector.fixture";

describe("XdrInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<XdrInspectorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a decoded envelope on screen", async () => {
    const { container, user } = renderFeature(<XdrInspectorPanel />);

    await user.click(screen.getByLabelText(copy.formLabel));
    await user.paste(paymentXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.summaryTitle);

    await expectNoAxeViolations(container);
  });
});
