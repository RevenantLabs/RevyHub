import { expect, test } from "@playwright/test";
import { claimant, normalPage } from "../fixtures/claimableBalanceDeadlineBoard.fixture";

test("shows fetched pages, an absolute deadline, and an undated relative condition", async ({ page }) => {
  let requests = 0;
  await page.route("https://horizon-testnet.stellar.org/claimable_balances?**", async (route) => {
    requests += 1;
    const url = new URL(route.request().url());
    expect(url.searchParams.get("claimant")).toBe(claimant);
    await route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(normalPage) });
  });
  await page.goto("/tools/claimable-balance-deadline-board");
  await page.getByLabel("Claimant account").fill(claimant);
  await page.getByRole("button", { name: "Check deadlines" }).click();
  await expect(page.getByText("1 page fetched")).toBeVisible();
  await expect(page.getByRole("region", { name: "Dated conditions" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Undated or indeterminate conditions" })).toBeVisible();
  expect(requests).toBe(1);
});
