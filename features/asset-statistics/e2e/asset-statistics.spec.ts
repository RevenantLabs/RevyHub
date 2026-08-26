import { expect, test } from "@playwright/test";

test("Asset Statistics e2e", async ({ page }) => {
  await page.goto("/tools/asset-statistics");
  
  await expect(page.getByText("No asset checked yet")).toBeVisible();
  
  // We can't guarantee horizon state in e2e without a known good asset,
  // but we can test the form validation works.
  await page.getByRole("button", { name: "Check statistics" }).click();
  await expect(page.getByText("Enter an asset code")).toBeVisible();
});
