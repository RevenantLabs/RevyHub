import { describe, it, expect } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { AccountOffersInspectorPanel } from "@/features/account-offers-inspector/components/AccountOffersInspectorPanel";
import { copy } from "@/features/account-offers-inspector/copy";

describe("AccountOffersInspectorPanel", () => {
  it("renders form with empty state", () => {
    renderFeature(<AccountOffersInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeTruthy();
    expect(screen.getByText(copy.submit)).toBeTruthy();
  });

  it("has accessible form fields", () => {
    renderFeature(<AccountOffersInspectorPanel />);
    expect(screen.getByLabelText(copy.formLabel)).toBeTruthy();
  });
});
