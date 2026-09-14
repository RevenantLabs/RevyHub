import { test, expect } from "@playwright/test";

test.describe("Horizon URL Builder", () => {
  test("builds a URL", async ({ page }) => {
    await page.goto("/tools/horizon-url-builder");
    await expect(page.getByText("No URL built yet")).toBeVisible();

    await page.click("button:has-text('Build URL')");
    await expect(page.getByText("Built URL")).toBeVisible();
  });
});
