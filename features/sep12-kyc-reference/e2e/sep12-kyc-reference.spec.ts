import { test, expect } from "@playwright/test";

test.describe("SEP-12 KYC Field Reference", () => {
  test("searches for a KYC field", async ({ page }) => {
    await page.goto("/tools/sep12-kyc-reference");
    await expect(page.getByText("No field selected")).toBeVisible();

    await page.fill('input[type="text"]', "first_name");
    await page.click("button:has-text('Search')");

    await expect(page.getByText("first_name")).toBeVisible();
  });

  test("filters by category", async ({ page }) => {
    await page.goto("/tools/sep12-kyc-reference");
    await page.selectOption("#category-filter", "personal");
    await page.click("button:has-text('Search')");
    await expect(page.getByText("first_name")).toBeVisible();
  });
});
