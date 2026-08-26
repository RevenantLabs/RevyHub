import { test, expect } from "@playwright/test";
import { copy } from "../copy";
import { sourceId, destinationId } from "../fixtures/account-merge-preflight.fixture";

test("Account Merge Preflight end-to-end", async ({ page }) => {
  await page.goto("/tools/account-merge-preflight");
  
  await expect(page.getByRole("heading", { name: copy.emptyTitle })).toBeVisible();

  await page.getByLabel(copy.formSourceLabel).fill(sourceId);
  await page.getByLabel(copy.formDestinationLabel).fill(destinationId);
  await page.getByRole("button", { name: copy.submit }).click();

  await expect(page.getByRole("heading", { name: copy.mergeableTitle })).toBeVisible();
});
