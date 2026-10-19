import { test, expect } from "@playwright/test";
import { successHash, successRecord, successOperations } from "../fixtures/operationResultXdrDecoder.fixture";

const base = "https://horizon-testnet.stellar.org";
test("validates a hash, then explains a settled operation result", async ({ page }) => {
  const requests: string[] = [];
  await page.route(`${base}/transactions/**`, async (route) => {
    const url = new URL(route.request().url());
    requests.push(url.pathname);
    const operations = url.pathname.endsWith("/operations");
    await route.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(operations ? successOperations : successRecord) });
  });
  await page.goto("/tools/operation-result-xdr-decoder");
  await page.getByRole("textbox", { name: /Transaction hash/ }).fill("bad");
  await page.getByRole("button", { name: "Decode result" }).click();
  await expect(page.getByText("Invalid transaction hash")).toBeVisible();
  expect(requests).toHaveLength(0);
  await page.getByRole("textbox", { name: /Transaction hash/ }).fill(successHash);
  await page.getByRole("button", { name: "Decode result" }).click();
  await expect(page.getByText("All operations succeeded.")).toBeVisible();
  await expect(page.getByText("bump_sequence_success")).toBeVisible();
  expect(requests).toEqual([`/transactions/${successHash}`, `/transactions/${successHash}/operations`]);
});
