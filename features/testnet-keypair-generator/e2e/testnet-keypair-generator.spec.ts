import { test, expect } from "@playwright/test";

test.describe("Testnet Keypair Generator", () => {
  test("generates a keypair", async ({ page }) => {
    await page.goto("/tools/testnet-keypair-generator");
    await expect(page.getByText("No keypair generated yet")).toBeVisible();

    await page.click("button:has-text('Generate New')");
    await expect(page.getByText("Generated Keypair")).toBeVisible();
  });
});
