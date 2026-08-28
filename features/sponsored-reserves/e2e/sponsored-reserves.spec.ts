import { test, expect } from "@playwright/test";
import { copy } from "../copy";
import { accountId } from "../fixtures/sponsoredReserves.fixture";

test.describe("Sponsored Reserves Inspector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/sponsored-reserves");
  });

  test("shows empty state initially", async ({ page }) => {
    await expect(page.getByText(copy.description)).toBeVisible();
    await expect(page.getByRole("button", { name: copy.submit })).toBeVisible();
  });

  test("loads and displays sponsored reserves", async ({ page }) => {
    await page.getByLabel(copy.formLabel).fill(accountId);
    await page.getByRole("button", { name: copy.submit }).click();

    await expect(page.getByText(copy.result.sponsoredByOthers)).toBeVisible();
    await expect(page.getByText(copy.result.sponsoringForOthers)).toBeVisible();
  });
});
