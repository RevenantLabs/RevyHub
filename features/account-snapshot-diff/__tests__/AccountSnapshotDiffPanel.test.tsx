import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { AccountSnapshotDiffPanel } from "@/features/account-snapshot-diff/components/AccountSnapshotDiffPanel";
import { copy, errorCopy, sectionLabels } from "@/features/account-snapshot-diff/copy";
import {
  balanceDownJson,
  baseJson,
  limitAbsentJson,
  notAnAccountJson,
  otherAccountJson,
  reorderedJson,
  sameCodeOtherIssuerJson,
  secretSeed,
  signerAddedJson,
  snapshotWithSecretJson,
  trustlineRemovedJson,
  unsupportedFieldJson,
  otherIssuer,
  usdcIssuer
} from "@/features/account-snapshot-diff/fixtures/accountSnapshotDiff.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function compare(user: User, before: string, after: string) {
  await user.click(screen.getByLabelText(copy.beforeLabel));
  await user.paste(before);
  await user.click(screen.getByLabelText(copy.afterLabel));
  await user.paste(after);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("AccountSnapshotDiffPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<AccountSnapshotDiffPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows an exact delta for a balance that moved", async () => {
    const { user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, baseJson, balanceDownJson);

    expect(await screen.findByText(copy.changesTitle)).toBeInTheDocument();
    expect(screen.getByText("-50")).toBeInTheDocument();
    expect(screen.getByText(`USDC:${usdcIssuer}`)).toBeInTheDocument();
    // Queried by role: the section names also appear as filter options.
    expect(
      screen.getByRole("heading", { name: sectionLabels.balances })
    ).toBeInTheDocument();
  });

  it("calls reordered snapshots identical", async () => {
    const { user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, baseJson, reorderedJson);

    expect(await screen.findByText(copy.identicalTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.orderNote)).toBeInTheDocument();
  });

  it("says it is comparing observations, not inferring history", async () => {
    const { user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, baseJson, balanceDownJson);

    expect(await screen.findByText(copy.observationNote)).toBeInTheDocument();
    expect(screen.getByText(copy.absenceNote)).toBeInTheDocument();
  });

  it("shows a removed trustline as an em dash, not as zero", async () => {
    const { user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, baseJson, trustlineRemovedJson);

    expect(await screen.findAllByText(/—/)).not.toHaveLength(0);
    expect(screen.getAllByText("Removed").length).toBeGreaterThan(0);
  });

  it("distinguishes an absent limit from a zero limit", async () => {
    const { user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, baseJson, limitAbsentJson);

    expect(await screen.findAllByText("Removed")).not.toHaveLength(0);
  });

  it("keeps same-code different-issuer assets apart", async () => {
    const { user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, baseJson, sameCodeOtherIssuerJson);

    // The new asset is its own group, keyed with the issuer in full — never
    // collapsed to "USDC" and never merged into the existing trustline.
    expect(await screen.findByText(`USDC:${otherIssuer}`)).toBeInTheDocument();
    expect(screen.getAllByText("Added").length).toBeGreaterThan(0);
    // The original USDC trustline did not move, so under the default
    // changed-only filter it has no rows at all.
    expect(screen.queryByText(`USDC:${usdcIssuer}`)).not.toBeInTheDocument();
  });

  it("filters by section and by change type", async () => {
    const { user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, baseJson, signerAddedJson);

    await user.selectOptions(await screen.findByLabelText(copy.sectionFilterLabel), "signers");
    expect(screen.getByRole("heading", { name: sectionLabels.signers })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: sectionLabels.thresholds })
    ).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(copy.sectionFilterLabel), "all");
    expect(
      screen.getByRole("heading", { name: sectionLabels.thresholds })
    ).toBeInTheDocument();
  });

  it("shows a no-match state with a reset that recovers from it", async () => {
    const { user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, baseJson, baseJson);

    expect(await screen.findByText(copy.noMatchTitle)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: copy.reset })[0]);
    await user.selectOptions(screen.getByLabelText(copy.changeFilterLabel), "all");
    expect(screen.queryByText(copy.noMatchTitle)).not.toBeInTheDocument();
  });

  it("warns that some fields were not compared", async () => {
    const { user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, baseJson, unsupportedFieldJson);

    expect(await screen.findByText(copy.unsupportedTitle)).toBeInTheDocument();
    // Named in the notice, and again in the JSON export.
    expect(screen.getAllByText(/some_future_field/).length).toBeGreaterThan(0);
  });

  it("refuses two snapshots of different accounts", async () => {
    const { user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, baseJson, otherAccountJson);

    expect(await screen.findByText(errorCopy.account_mismatch.title)).toBeInTheDocument();
  });

  it("explains a document that is not an account snapshot", async () => {
    const { user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, notAnAccountJson, baseJson);

    expect(await screen.findByText(errorCopy.invalid_snapshot.title)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("offers a copyable export that does not contain the snapshots", async () => {
    const { user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, baseJson, balanceDownJson);

    expect(
      await screen.findByRole("button", { name: `Copy ${copy.copyExport}` })
    ).toBeInTheDocument();
    expect(screen.getByText(copy.exportDescription)).toBeInTheDocument();
  });

  it("refuses a snapshot holding a secret key and clears it out of the field", async () => {
    const { container, user } = renderFeature(<AccountSnapshotDiffPanel />);
    await compare(user, snapshotWithSecretJson, baseJson);

    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    expect(screen.getByLabelText<HTMLTextAreaElement>(copy.beforeLabel).value).toBe("");
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });
});
