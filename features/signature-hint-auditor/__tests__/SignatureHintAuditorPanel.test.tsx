import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { SignatureHintAuditorPanel } from "@/features/signature-hint-auditor/components/SignatureHintAuditorPanel";
import { copy, errorCopy, groupLabels } from "@/features/signature-hint-auditor/copy";
import {
  feeBumpXdr,
  feeSource,
  notBase64,
  secretSeed,
  signedClassicXdr,
  source,
  sourceHint,
  unrelatedSigner
} from "@/features/signature-hint-auditor/fixtures/signatureHintAuditor.fixture";
import {
  collidingCandidates,
  collisionHint
} from "@/features/signature-hint-auditor/fixtures/hint-collision.fixture";
import { formatHint } from "@/features/signature-hint-auditor/lib/format";

type User = ReturnType<typeof renderFeature>["user"];

async function audit(user: User, envelope: string, publicSigners = "") {
  await user.click(screen.getByLabelText(copy.envelopeLabel));
  await user.paste(envelope);
  if (publicSigners) {
    await user.click(screen.getByLabelText(copy.signersLabel));
    await user.paste(publicSigners);
  }
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("SignatureHintAuditorPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<SignatureHintAuditorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("lists a hint match without calling it verified", async () => {
    const { user } = renderFeature(<SignatureHintAuditorPanel />);
    await audit(user, signedClassicXdr, source.publicKey());

    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.disclaimer)).toBeInTheDocument();
    expect(screen.getByText(copy.oneCandidate)).toBeInTheDocument();
    expect(screen.getAllByText(formatHint(sourceHint)).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(copy.matchSingle)).toBeInTheDocument();
  });

  it("separates fee-bump outer and inner groups", async () => {
    const { user } = renderFeature(<SignatureHintAuditorPanel />);
    await audit(user, feeBumpXdr, `${feeSource.publicKey()}\n${source.publicKey()}`);

    expect(await screen.findByText(groupLabels.fee_bump_outer)).toBeInTheDocument();
    expect(screen.getByText(groupLabels.fee_bump_inner)).toBeInTheDocument();
  });

  it("explains an unmatched hint", async () => {
    const { user } = renderFeature(<SignatureHintAuditorPanel />);
    await audit(user, signedClassicXdr, unrelatedSigner.publicKey());

    expect(await screen.findByText(copy.unmatchedLabel)).toBeInTheDocument();
    expect(screen.getByText(copy.collisionNoticeTitle)).toBeInTheDocument();
  });

  it("shows actionable copy for invalid xdr", async () => {
    const { user } = renderFeature(<SignatureHintAuditorPanel />);
    await audit(user, notBase64);

    expect(await screen.findByText(errorCopy.invalid_xdr.title)).toBeInTheDocument();
    expect(screen.getByText(errorCopy.invalid_xdr.description)).toBeInTheDocument();
  });

  it("refuses a secret seed and clears it from the field", async () => {
    const { user } = renderFeature(<SignatureHintAuditorPanel />);
    await audit(user, secretSeed);

    expect(await screen.findByText(errorCopy.invalid_xdr.title)).toBeInTheDocument();
    expect(screen.queryByDisplayValue(secretSeed)).not.toBeInTheDocument();
  });

  it("states that input stays in memory only", async () => {
    const { user } = renderFeature(<SignatureHintAuditorPanel />);
    await audit(user, signedClassicXdr);

    expect(await screen.findByText(copy.memoryNote)).toBeInTheDocument();
  });

  it("documents colliding candidates share a forced hint in fixtures", () => {
    expect(collidingCandidates).toHaveLength(2);
    expect(collidingCandidates[0].hint).toBe(collisionHint);
    expect(collidingCandidates[1].hint).toBe(collisionHint);
  });
});
