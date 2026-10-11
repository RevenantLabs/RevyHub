import { test, expect } from "@playwright/test";

test.describe("Network Passphrase Inspector", () => {
  test("searches for networks", async ({ page }) => {
    await page.goto("/tools/network-passphrase-inspector");
    await expect(page.getByText("No network selected")).toBeVisible();

    await page.fill('input[type="text"]', "testnet");
    await page.click("button:has-text('Search')");

    await expect(page.getByText("Test SDF Network")).toBeVisible();
  });
});
