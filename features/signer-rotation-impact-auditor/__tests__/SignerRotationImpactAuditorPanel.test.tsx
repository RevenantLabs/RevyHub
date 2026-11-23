import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { SignerRotationImpactAuditorPanel } from "@/features/signer-rotation-impact-auditor/components/SignerRotationImpactAuditorPanel";
import { copy, errorCopy } from "@/features/signer-rotation-impact-auditor/copy";
import {
  finalLockoutXdr,
  normalSnapshot,
  notBase64,
  recoveredRotationXdr,
  safeRotationXdr,
  secretSeed
} from "@/features/signer-rotation-impact-auditor/fixtures/normal.fixture";
import { missingSignersSnapshot } from "@/features/signer-rotation-impact-auditor/fixtures/boundary.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function fill(user: User, field: string, text: string) {
  await user.click(screen.getByLabelText(field));
  await user.paste(text);
}

async function audit(user: User, snapshot: string, envelope: string) {
  await fill(user, copy.snapshotLabel, snapshot);
  await fill(user, copy.envelopeLabel, envelope);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("SignerRotationImpactAuditorPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<SignerRotationImpactAuditorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a successful audit overview", async () => {
    const { user } = renderFeature(<SignerRotationImpactAuditorPanel />);
    await audit(user, normalSnapshot, safeRotationXdr);

    expect(await screen.findByText(copy.noLockoutTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.timelineTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.overviewTitle)).toBeInTheDocument();
  });

  it("announces recovered intermediate lockout", async () => {
    const { user } = renderFeature(<SignerRotationImpactAuditorPanel />);
    await audit(user, normalSnapshot, recoveredRotationXdr);

    expect(await screen.findByText(copy.recoveredTitle)).toBeInTheDocument();
  });

  it("announces final lockout", async () => {
    const { user } = renderFeature(<SignerRotationImpactAuditorPanel />);
    await audit(user, normalSnapshot, finalLockoutXdr);

    expect(await screen.findByText(copy.finalLockoutTitle)).toBeInTheDocument();
  });

  it("shows incomplete-evidence state when signers are missing", async () => {
    const { user } = renderFeature(<SignerRotationImpactAuditorPanel />);
    await audit(user, missingSignersSnapshot, safeRotationXdr);

    expect(await screen.findByText(copy.incompleteTitle)).toBeInTheDocument();
  });

  it("shows a field-level error for malformed envelopes", async () => {
    const { user } = renderFeature(<SignerRotationImpactAuditorPanel />);
    await audit(user, normalSnapshot, notBase64);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      errorCopy.malformed_data.title
    );
  });

  it("refuses a secret seed and never echoes it", async () => {
    const { user } = renderFeature(<SignerRotationImpactAuditorPanel />);
    await audit(user, secretSeed, safeRotationXdr);

    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.invalid_input.title);
    expect(screen.queryByDisplayValue(secretSeed)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain(secretSeed);
  });
});
