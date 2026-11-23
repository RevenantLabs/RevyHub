import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { SignerRotationImpactAuditorPanel } from "@/features/signer-rotation-impact-auditor/components/SignerRotationImpactAuditorPanel";
import { copy } from "@/features/signer-rotation-impact-auditor/copy";
import {
  normalSnapshot,
  notBase64,
  safeRotationXdr
} from "@/features/signer-rotation-impact-auditor/fixtures/normal.fixture";
import { missingSignersSnapshot } from "@/features/signer-rotation-impact-auditor/fixtures/boundary.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function audit(user: User, snapshot: string, envelope: string) {
  await user.click(screen.getByLabelText(copy.snapshotLabel));
  await user.paste(snapshot);
  await user.click(screen.getByLabelText(copy.envelopeLabel));
  await user.paste(envelope);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("SignerRotationImpactAuditorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<SignerRotationImpactAuditorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a successful result", async () => {
    const { container, user } = renderFeature(<SignerRotationImpactAuditorPanel />);

    await audit(user, normalSnapshot, safeRotationXdr);
    await screen.findByText(copy.noLockoutTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations for incomplete evidence", async () => {
    const { container, user } = renderFeature(<SignerRotationImpactAuditorPanel />);

    await audit(user, missingSignersSnapshot, safeRotationXdr);
    await screen.findByText(copy.incompleteTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while showing an error", async () => {
    const { container, user } = renderFeature(<SignerRotationImpactAuditorPanel />);

    await audit(user, normalSnapshot, notBase64);
    await screen.findByRole("alert");

    await expectNoAxeViolations(container);
  });
});
