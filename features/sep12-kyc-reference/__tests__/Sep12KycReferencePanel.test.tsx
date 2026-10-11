import { describe, it, expect } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { Sep12KycReferencePanel } from "@/features/sep12-kyc-reference/components/Sep12KycReferencePanel";
import { copy } from "@/features/sep12-kyc-reference/copy";

describe("Sep12KycReferencePanel", () => {
  it("renders form with empty state", () => {
    renderFeature(<Sep12KycReferencePanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeTruthy();
    expect(screen.getByText(copy.submit)).toBeTruthy();
  });

  it("has accessible form fields", () => {
    renderFeature(<Sep12KycReferencePanel />);
    expect(screen.getByLabelText(copy.formLabel)).toBeTruthy();
  });
});
