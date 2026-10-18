import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { SignatureHintAuditorPanel } from "@/features/signature-hint-auditor/components/SignatureHintAuditorPanel";
import { copy, errorCopy } from "@/features/signature-hint-auditor/copy";
import {
  signedClassicXdr,
  source
} from "@/features/signature-hint-auditor/fixtures/signatureHintAuditor.fixture";

describe("SignatureHintAuditorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<SignatureHintAuditorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a successful audit on screen", async () => {
    const { container, user } = renderFeature(<SignatureHintAuditorPanel />);

    await user.click(screen.getByLabelText(copy.envelopeLabel));
    await user.paste(signedClassicXdr);
    await user.click(screen.getByLabelText(copy.signersLabel));
    await user.paste(source.publicKey());
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while showing an error", async () => {
    const { container, user } = renderFeature(<SignatureHintAuditorPanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(errorCopy.empty_xdr.title);

    await expectNoAxeViolations(container);
  });
});
