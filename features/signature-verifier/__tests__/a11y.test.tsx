import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { SignatureVerifierPanel } from "@/features/signature-verifier/components/SignatureVerifierPanel";

describe("SignatureVerifierPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<SignatureVerifierPanel />);
    await expectNoAxeViolations(container);
  });
});
