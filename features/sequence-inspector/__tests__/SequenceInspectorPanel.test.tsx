import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { SequenceInspectorPanel } from "@/features/sequence-inspector/components/SequenceInspectorPanel";
import { copy, errorCopy } from "@/features/sequence-inspector/copy";
import { handlers } from "@/features/sequence-inspector/msw/handlers";
import {
  accountId,
  bumpTarget,
  currentSequence,
  nextSequence,
  secretSeed
} from "@/features/sequence-inspector/fixtures/sequenceInspector.fixture";

withMswHandlers(...handlers);

describe("SequenceInspectorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<SequenceInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<SequenceInspectorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.empty_input.title)).toBeInTheDocument();
  });

  it("shows exact current, next and bump values from Horizon", async () => {
    const { user } = renderFeature(<SequenceInspectorPanel />);
    await user.type(screen.getByLabelText(copy.accountLabel), accountId);
    await user.type(screen.getByLabelText(copy.bumpLabel), bumpTarget.toString());
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getByText(currentSequence.toString())).toBeInTheDocument();
    expect(screen.getByText(nextSequence.toString())).toBeInTheDocument();
    expect(screen.getByText(bumpTarget.toString())).toBeInTheDocument();
    expect(screen.getByText(copy.txBadSeqTitle)).toBeInTheDocument();
  });

  it("copies the next sequence as exact decimal digits", async () => {
    const { user } = renderFeature(<SequenceInspectorPanel />);
    await user.type(screen.getByLabelText(copy.accountLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);

    await user.click(screen.getByRole("button", { name: `Copy ${copy.copyNext}` }));
    expect(await navigator.clipboard.readText()).toBe(nextSequence.toString());
  });

  it("rejects a stale bump target after loading the current sequence", async () => {
    const { user } = renderFeature(<SequenceInspectorPanel />);
    await user.type(screen.getByLabelText(copy.accountLabel), accountId);
    await user.type(screen.getByLabelText(copy.bumpLabel), currentSequence.toString());
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.invalid_bump_target.title)).toBeInTheDocument();
  });

  it("does not echo a submitted secret seed into result or error copy", async () => {
    const { user, container } = renderFeature(<SequenceInspectorPanel />);
    await user.type(screen.getByLabelText(copy.accountLabel), secretSeed);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });
});
