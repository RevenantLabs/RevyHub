/** Browser journey covering overlap removal and explicit page counts. */
import { test, expect } from "@playwright/test";
import { accountId } from "@/features/account-activity-rollup/fixtures/accountActivityRollup.fixture";

test("loads an older page without double-counting an overlapping token", async ({ page }) => {
  await page.route("**/accounts/*/operations?**", async (route) => {
    const cursor = new URL(route.request().url()).searchParams.get("cursor");
    const tokens = cursor ? ["81", "80"] : Array.from({ length: 20 }, (_, index) => String(100 - index));
    await route.fulfill({ json: { _embedded: { records: tokens.map((paging_token) => ({ paging_token, type: "payment", created_at: "2024-01-15T12:00:00Z" })) } } });
  });
  await page.goto("/tools/account-activity-rollup");
  await page.getByLabel("Account address").fill(accountId);
  await page.getByRole("button", { name: "Summarize activity" }).click();
  await page.getByRole("button", { name: "Load next page" }).click();
  await expect(page.getByText("This aggregate includes 21 unique records across 2 fetched pages.")).toBeVisible();
});
