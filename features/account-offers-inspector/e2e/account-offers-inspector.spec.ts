import { test, expect } from "@playwright/test";

test.describe("Account Offers Inspector", () => {
  test("renders empty state initially", async ({ page }) => {
    await page.goto("/tools/account-offers-inspector");
    await expect(page.getByText("No account loaded yet")).toBeVisible();
  });

  it("shows form for entering account address", async ({ page }) => {
    await page.goto("/tools/account-offers-inspector");
    await expect(page.getByLabelText(/Account address/)).toBeVisible();
  });
});
