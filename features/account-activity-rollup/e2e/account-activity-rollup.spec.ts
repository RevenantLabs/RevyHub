/** Executable browser journey for the primary account rollup. */
import { test, expect } from "@playwright/test";
import { accountId } from "@/features/account-activity-rollup/fixtures/accountActivityRollup.fixture";

const route = "/tools/account-activity-rollup";
test("shows a network-tagged, bounded activity aggregate", async ({ page }) => {
  await page.route("**/accounts/*/operations?**", async (route) => {
    await route.fulfill({ json: { _embedded: { records: [
      { paging_token: "100", type: "payment", created_at: "2024-01-15T23:00:00Z" },
      { paging_token: "99", type: "change_trust", created_at: "2024-01-14T23:00:00Z" }
    ] } } });
  });
  await page.goto(route);
  await page.getByLabel("Account address").fill(accountId);
  await page.getByRole("button", { name: "Summarize activity" }).click();
  await expect(page.getByText("This aggregate includes 2 unique records across 1 fetched page.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Account activity rollup" }).getByText("testnet")).toBeVisible();
  await expect(page.getByRole("heading", { name: "By operation type" })).toBeVisible();
  await expect(page.getByText("2024-01-14 – 2024-01-15")).toBeVisible();
});
