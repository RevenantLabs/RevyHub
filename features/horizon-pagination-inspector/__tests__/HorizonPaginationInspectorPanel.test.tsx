import { describe, it, expect } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { HorizonPaginationInspectorPanel } from "@/features/horizon-pagination-inspector/components/HorizonPaginationInspectorPanel";
import { copy } from "@/features/horizon-pagination-inspector/copy";

describe("HorizonPaginationInspectorPanel", () => {
  it("renders form with empty state", () => {
    renderFeature(<HorizonPaginationInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeTruthy();
    expect(screen.getByText(copy.submit)).toBeTruthy();
  });

  it("has accessible form fields", () => {
    renderFeature(<HorizonPaginationInspectorPanel />);
    expect(screen.getByLabelText(copy.formLabel)).toBeTruthy();
  });
});
