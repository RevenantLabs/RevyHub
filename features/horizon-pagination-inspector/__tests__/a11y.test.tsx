import { describe, it } from "vitest";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { renderFeature, screen } from "@/core/testing/render";
import { HorizonPaginationInspectorPanel } from "@/features/horizon-pagination-inspector/components/HorizonPaginationInspectorPanel";
import { copy } from "@/features/horizon-pagination-inspector/copy";
import {
  malformedJson,
  validCollectionJson
} from "@/features/horizon-pagination-inspector/fixtures/horizonPaginationInspector.fixture";

describe("HorizonPaginationInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial idle state", async () => {
    const { container } = renderFeature(<HorizonPaginationInspectorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with inspection results on screen", async () => {
    const { container, user } = renderFeature(<HorizonPaginationInspectorPanel />);

    await user.click(screen.getByLabelText(copy.collectionLabel));
    await user.paste(validCollectionJson);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.overviewTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while displaying an error message", async () => {
    const { container, user } = renderFeature(<HorizonPaginationInspectorPanel />);

    await user.click(screen.getByLabelText(copy.collectionLabel));
    await user.paste(malformedJson);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");

    await expectNoAxeViolations(container);
  });
});
