import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { Sep7SignatureVerifierPanel } from "@/features/sep7-signature-verifier/components/Sep7SignatureVerifierPanel";
import { copy } from "@/features/sep7-signature-verifier/copy";

describe("Sep7SignatureVerifierPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<Sep7SignatureVerifierPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<Sep7SignatureVerifierPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
