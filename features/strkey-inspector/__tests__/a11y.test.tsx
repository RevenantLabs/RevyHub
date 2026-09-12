import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { StrkeyInspectorPanel } from "@/features/strkey-inspector/components/StrkeyInspectorPanel";
import { copy, errorCopy } from "@/features/strkey-inspector/copy";
import { validPublicKey } from "@/features/strkey-inspector/fixtures/strkeyInspector.fixture";

describe("StrkeyInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<StrkeyInspectorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations once a result is shown", async () => {
    const { container, user } = renderFeature(<StrkeyInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), validPublicKey);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in an error state", async () => {
    const { container, user } = renderFeature(<StrkeyInspectorPanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(errorCopy.empty_input.title);

    await expectNoAxeViolations(container);
  });
});
