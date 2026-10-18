import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { MemoInspectorPanel } from "@/features/memo-inspector/components/MemoInspectorPanel";
import { copy, errorCopy } from "@/features/memo-inspector/copy";
import { hashHex } from "@/features/memo-inspector/fixtures/memoInspector.fixture";

describe("MemoInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<MemoInspectorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with an encoded memo on screen", async () => {
    const { container, user } = renderFeature(<MemoInspectorPanel />);

    await user.selectOptions(screen.getByLabelText(copy.kindLabel), "hash");
    await user.type(screen.getByLabelText(copy.valueLabels.hash), hashHex);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while an error is shown", async () => {
    const { container, user } = renderFeature(<MemoInspectorPanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(errorCopy.empty_input.title);

    await expectNoAxeViolations(container);
  });
});
