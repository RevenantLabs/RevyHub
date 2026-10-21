import { test, expect } from "@playwright/test";
import { feeBumpHash, feeBumpRecord, feeBumpOperations } from "../fixtures/fee-bump-result.fixture";

const base = "https://horizon-testnet.stellar.org";
test("shows fee-bump outer and inner verdicts with the inner payment failure", async ({ page }) => {
  await page.route(`${base}/transactions/**`, async (route) => {
    const operations = new URL(route.request().url()).pathname.endsWith("/operations");
    await route.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(operations ? feeBumpOperations : feeBumpRecord) });
  });
  await page.goto("/tools/operation-result-xdr-decoder");
  await page.getByRole("textbox", { name: /Transaction hash/ }).fill(feeBumpHash);
  await page.getByRole("button", { name: "Decode result" }).click();
  await expect(page.getByText("Fee-bump wrapper")).toBeVisible();
  await expect(page.getByText("tx_fee_bump_inner_failed")).toBeVisible();
  await expect(page.getByText("payment_underfunded")).toBeVisible();
  await expect(page.getByText("An operation failed. No operation changes from this transaction were committed.")).toBeVisible();
});
