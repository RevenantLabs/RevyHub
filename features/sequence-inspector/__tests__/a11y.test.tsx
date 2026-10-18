import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { SequenceInspectorPanel } from "@/features/sequence-inspector/components/SequenceInspectorPanel";
import { copy } from "@/features/sequence-inspector/copy";
import { handlers } from "@/features/sequence-inspector/msw/handlers";
import { accountId } from "@/features/sequence-inspector/fixtures/sequenceInspector.fixture";

withMswHandlers(...handlers);

describe("SequenceInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<SequenceInspectorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in its result state", async () => {
    const { container, user } = renderFeature(<SequenceInspectorPanel />);
    await user.type(screen.getByLabelText(copy.accountLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);
    await expectNoAxeViolations(container);
  });
});
