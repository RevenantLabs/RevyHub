import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { SorobanAuthInspectorPanel } from "@/features/soroban-auth-inspector/components/SorobanAuthInspectorPanel";
import { copy } from "@/features/soroban-auth-inspector/copy";
import { buildAuthTreeEnvelopeXdr } from "@/features/soroban-auth-inspector/fixtures/sorobanAuthInspector.fixture";

describe("SorobanAuthInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<SorobanAuthInspectorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with rendered authorization entries", async () => {
    const { container, user } = renderFeature(<SorobanAuthInspectorPanel />);

    await user.click(screen.getByLabelText(copy.formLabel));
    await user.paste(buildAuthTreeEnvelopeXdr());
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await waitFor(() => expect(screen.getByText(copy.resultTitle)).toBeInTheDocument());

    await expectNoAxeViolations(container);
  });
});
