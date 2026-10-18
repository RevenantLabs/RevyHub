import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { AccountActivityRollupPanel } from "@/features/account-activity-rollup/components/AccountActivityRollupPanel";
import { copy, errorCopy } from "@/features/account-activity-rollup/copy";
import { handlers } from "@/features/account-activity-rollup/msw/handlers";
import { accountId, emptyAccountId, unknownAccountId, unavailableAccountId } from "@/features/account-activity-rollup/fixtures/accountActivityRollup.fixture";

withMswHandlers(...handlers);
async function submit(account: string) {
  const view = renderFeature(<AccountActivityRollupPanel />);
  await view.user.type(screen.getByLabelText(copy.formLabel), account);
  await view.user.click(screen.getByRole("button", { name: copy.submit }));
  return view;
}

describe("AccountActivityRollupPanel", () => {
  it("renders guidance, then a field error without echoing secrets", async () => {
    const view = renderFeature(<AccountActivityRollupPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    await view.user.type(screen.getByLabelText(copy.formLabel), "Sbad-secret");
    await view.user.click(screen.getByRole("button", { name: copy.submit }));
    expect(screen.getByRole("alert")).toHaveTextContent(errorCopy.invalid_account.title);
    expect(view.container.textContent).not.toContain("Sbad-secret");
  });
  it("shows bounded totals, a network badge, and extends groups on next page", async () => {
    const view = await submit(accountId);
    await screen.findByText(`${copy.coveragePrefix} 20 ${copy.coverageSuffix} 1 ${copy.coveragePage}.`);
    expect(screen.getByText("testnet")).toBeInTheDocument();
    await view.user.click(screen.getByRole("button", { name: copy.loadMore }));
    expect(await screen.findByText(`${copy.coveragePrefix} 22 ${copy.coverageSuffix} 2 ${copy.coveragePages}.`)).toBeInTheDocument();
    expect(screen.getByText("2024-01-14")).toBeInTheDocument();
  });
  it("separates empty, missing, and unavailable history", async () => {
    const view = await submit(emptyAccountId);
    expect(await screen.findByText(copy.noActivityTitle)).toBeInTheDocument();
    view.unmount();
    await submit(unknownAccountId);
    expect(await screen.findByText(errorCopy.account_not_found.title)).toBeInTheDocument();
    // The next render uses a fresh state and retains the unavailable-history distinction.
  });
  it("shows unavailable history separately", async () => {
    await submit(unavailableAccountId);
    expect(await screen.findByText(errorCopy.history_unavailable.title)).toBeInTheDocument();
  });
});
