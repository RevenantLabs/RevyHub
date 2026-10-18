import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { Sep7SignatureVerifierPanel } from "@/features/sep7-signature-verifier/components/Sep7SignatureVerifierPanel";
import { copy } from "@/features/sep7-signature-verifier/copy";
import { handlers } from "@/features/sep7-signature-verifier/msw/handlers";
import { signedUri } from "@/features/sep7-signature-verifier/fixtures/sep7SignatureVerifier.fixture";
import { withMswHandlers } from "@/core/testing/msw";

withMswHandlers(...handlers);

describe("Sep7SignatureVerifierPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<Sep7SignatureVerifierPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations after a verified request", async () => {
    const { container, user } = renderFeature(<Sep7SignatureVerifierPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), signedUri);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("heading", { name: copy.resultTitle });
    await expectNoAxeViolations(container);
  });
});
