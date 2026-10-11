import { test, expect } from "@playwright/test";

test.describe("Horizon Pagination Inspector", () => {
  test("renders empty state", async ({ page }) => {
    await page.goto("/tools/horizon-pagination-inspector");
    await expect(page.getByText("No response inspected yet")).toBeVisible();
  });

  test("inspects a JSON response", async ({ page }) => {
    await page.goto("/tools/horizon-pagination-inspector");
    await page.fill("textarea", '{"_embedded":{"records":[{"id":"1"},{"id":"2"}]}}');
    await page.click("button:has-text('Inspect')");
    await expect(page.getByText("Pagination Info")).toBeVisible();
  });
});
