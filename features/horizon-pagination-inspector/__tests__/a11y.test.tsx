import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { HorizonPaginationInspectorPanel } from "@/features/horizon-pagination-inspector/components/HorizonPaginationInspectorPanel";
import { copy, errorCopy } from "@/features/horizon-pagination-inspector/copy";
import {
  completePageJson,
  notJson
} from "@/features/horizon-pagination-inspector/fixtures/horizonPaginationInspector.fixture";

describe("HorizonPaginationInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<HorizonPaginationInspectorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with an inspection on screen", async () => {
    const { container, user } = renderFeature(<HorizonPaginationInspectorPanel />);

    await user.click(screen.getByLabelText(copy.formLabel));
    await user.paste(completePageJson);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.summaryTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in its error state", async () => {
    const { container, user } = renderFeature(<HorizonPaginationInspectorPanel />);

    await user.click(screen.getByLabelText(copy.formLabel));
    await user.paste(notJson);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(errorCopy.not_json.title);

    await expectNoAxeViolations(container);
  });
});
