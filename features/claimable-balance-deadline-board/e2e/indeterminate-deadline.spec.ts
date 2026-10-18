import { expect, test } from "@playwright/test";
import { claimant } from "../fixtures/claimableBalanceDeadlineBoard.fixture";
import { nestedBalance } from "../fixtures/nested-deadlines.fixture";

test("keeps a nested predicate undated and displays its structure", async ({ page }) => {
  await page.route("https://horizon-testnet.stellar.org/claimable_balances?**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ _embedded: { records: [nestedBalance] } }) })
  );
  await page.goto("/tools/claimable-balance-deadline-board");
  await page.getByLabel("Claimant account").fill(claimant);
  await page.getByRole("button", { name: "Check deadlines" }).click();
  const undated = page.getByRole("region", { name: "Undated or indeterminate conditions" });
  await expect(undated).toBeVisible();
  await expect(undated.getByText("Any condition")).toBeVisible();
  await expect(undated.getByText("All conditions")).toBeVisible();
  await expect(undated.getByText("Not", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Dated conditions" })).toHaveCount(0);
});
