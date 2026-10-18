import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { PreconditionsExplainerPanel } from "@/features/preconditions-explainer/components/PreconditionsExplainerPanel";
import {
  copy,
  errorCopy,
  signerKindCopy,
  verdictCopy
} from "@/features/preconditions-explainer/copy";
import {
  handlers,
  serverErrorHandler
} from "@/features/preconditions-explainer/msw/handlers";
import {
  expiredXdr,
  extraSigner,
  ledgerBoundsOnlyXdr,
  notBase64,
  notYetValidXdr,
  openXdr,
  secretSeed,
  unconditionalXdr
} from "@/features/preconditions-explainer/fixtures/preconditionsExplainer.fixture";

const server = withMswHandlers(...handlers);

async function explain(user: ReturnType<typeof renderFeature>["user"], value: string) {
  await user.click(screen.getByLabelText(copy.formLabel));
  await user.paste(value);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("PreconditionsExplainerPanel", () => {
  it("shows the empty state before any interaction", () => {
    renderFeature(<PreconditionsExplainerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows time bounds as dates and as durations relative to now", async () => {
    const { user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, openXdr);

    expect(await screen.findByText(copy.timeBoundsTitle)).toBeInTheDocument();
    expect(screen.getByText(/UTC \(1 hour ago\)/)).toBeInTheDocument();
    expect(screen.getByText(/UTC \(in 2 hours\)/)).toBeInTheDocument();
  });

  it("compares ledger bounds against the current ledger", async () => {
    const { user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, openXdr);

    expect(await screen.findByText(copy.ledgerBoundsTitle)).toBeInTheDocument();
    expect(screen.getByText("#1,399,000 (1000 ledgers ago)")).toBeInTheDocument();
    expect(screen.getByText("#1,405,000 (5000 ledgers away)")).toBeInTheDocument();
    expect(screen.getByText("#1,400,000")).toBeInTheDocument();
  });

  it("explains what the minimum sequence rules gate", async () => {
    const { user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, openXdr);

    expect(await screen.findByText(copy.sequenceRulesTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.minSequenceNumberGate)).toBeInTheDocument();
    expect(screen.getByText(copy.minSequenceAgeGate)).toBeInTheDocument();
    expect(screen.getByText(copy.minSequenceLedgerGapGate)).toBeInTheDocument();
  });

  it("lists the extra signers", async () => {
    const { user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, openXdr);

    expect(await screen.findByText(copy.extraSignersTitle)).toBeInTheDocument();
    expect(screen.getByText(signerKindCopy.ed25519)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Copy extra signer 1` })
    ).toBeInTheDocument();
    expect(screen.getByTitle(extraSigner.publicKey())).toBeInTheDocument();
  });

  it("calls out an expired transaction", async () => {
    const { user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, expiredXdr);

    expect(await screen.findByText(verdictCopy.expired.title)).toBeInTheDocument();
  });

  it("separates a transaction that is not valid yet from an expired one", async () => {
    const { user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, notYetValidXdr);

    expect(await screen.findByText(verdictCopy.not_yet.title)).toBeInTheDocument();
  });

  it("describes a transaction with no preconditions as valid indefinitely", async () => {
    const { user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, unconditionalXdr);

    expect(await screen.findByText(errorCopy.no_preconditions.title)).toBeInTheDocument();
    expect(screen.getByText(errorCopy.no_preconditions.description)).toBeInTheDocument();
    // It is a finding, not a failure, so it is not announced assertively.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps showing the decoded bounds when the ledger fetch fails", async () => {
    server.use(serverErrorHandler);
    const { user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, ledgerBoundsOnlyXdr);

    expect(await screen.findByText(copy.degradedTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.ledgerBoundsUnknown)).toBeInTheDocument();
    expect(screen.getByText(copy.clockLocal)).toBeInTheDocument();
    expect(screen.getByText(verdictCopy.unknown.title)).toBeInTheDocument();
  });

  it("says when the answer was taken", async () => {
    const { user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, openXdr);

    expect(await screen.findByText(copy.snapshotTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.snapshotNote)).toBeInTheDocument();
    expect(screen.getByText(copy.clockLedger)).toBeInTheDocument();
  });

  it("reports unusable input as an error", async () => {
    const { user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, notBase64);

    expect(await screen.findByText(errorCopy.invalid_xdr.title)).toBeInTheDocument();
  });

  it("never echoes a pasted secret seed back into the result", async () => {
    const { user, container } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, secretSeed);

    expect(await screen.findByText(errorCopy.invalid_xdr.title)).toBeInTheDocument();
    expect(container.querySelectorAll("[role='alert']").length).toBeGreaterThan(0);

    // The seed stays in the control the user typed it into and nowhere else:
    // it is never decoded, echoed into the result, or named in the message.
    const field = screen.getByLabelText(copy.formLabel);
    const renderedElsewhere = (container.textContent ?? "").replace(field.textContent ?? "", "");
    expect(renderedElsewhere).not.toContain(secretSeed);
  });

  it("returns to the empty state when the result is dismissed", async () => {
    const { user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, openXdr);

    await user.click(await screen.findByRole("button", { name: copy.reset }));
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });
});
