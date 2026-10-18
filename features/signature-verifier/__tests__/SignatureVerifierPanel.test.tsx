import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { SignatureVerifierPanel } from "@/features/signature-verifier/components/SignatureVerifierPanel";
import { copy } from "@/features/signature-verifier/copy";

describe("SignatureVerifierPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<SignatureVerifierPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<SignatureVerifierPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
