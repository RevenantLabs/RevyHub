import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AccountSnapshotDiffPanel } from "@/features/account-snapshot-diff/components/AccountSnapshotDiffPanel";
import { copy } from "@/features/account-snapshot-diff/copy";
import {
  balanceDownJson,
  baseJson,
  notAnAccountJson,
  signerAddedJson
} from "@/features/account-snapshot-diff/fixtures/accountSnapshotDiff.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function compare(user: User, before: string, after: string) {
  await user.click(screen.getByLabelText(copy.beforeLabel));
  await user.paste(before);
  await user.click(screen.getByLabelText(copy.afterLabel));
  await user.paste(after);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("AccountSnapshotDiffPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AccountSnapshotDiffPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a comparison on screen", async () => {
    const { container, user } = renderFeature(<AccountSnapshotDiffPanel />);

    await compare(user, baseJson, balanceDownJson);
    await screen.findByText(copy.changesTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations across several sections", async () => {
    const { container, user } = renderFeature(<AccountSnapshotDiffPanel />);

    await compare(user, baseJson, signerAddedJson);
    await screen.findByText(copy.changesTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while showing an error", async () => {
    const { container, user } = renderFeature(<AccountSnapshotDiffPanel />);

    await compare(user, notAnAccountJson, baseJson);
    await screen.findByRole("alert");

    await expectNoAxeViolations(container);
  });
});
