import { test, expect } from "@playwright/test";
import { classicXdr } from "@/features/signing-payload-inspector/fixtures/classic-envelope.fixture";
import { copy, errorCopy } from "@/features/signing-payload-inspector/copy";

test("shows a classic signature base and recomputes for the selected network", async ({ page }) => {
  await page.goto("/tools/signing-payload-inspector");
  await expect(page.getByText(copy.emptyTitle)).toBeVisible();
  await page.getByLabel(copy.formLabel).fill(classicXdr);
  await page.getByRole("button", { name: copy.submit }).click();
  await expect(page.getByText(copy.classicTitle)).toBeVisible();
  const firstHash = await page.getByTestId("payload-hash").textContent();
  await expect(page.getByTestId("signature-base")).toContainText(/^[0-9a-f]+$/);
  await expect(page.getByTestId("payload-hash")).toContainText(/^[0-9a-f]{64}$/);

  await page.getByLabel(copy.networkLabel).selectOption("mainnet");
  await expect(page.getByText(copy.emptyTitle)).toBeVisible();
  await page.getByRole("button", { name: copy.submit }).click();
  await expect(page.getByText(copy.classicTitle)).toBeVisible();
  expect(await page.getByTestId("payload-hash").textContent()).not.toBe(firstHash);

  await page.getByLabel(copy.formLabel).fill("not xdr!");
  await page.getByRole("button", { name: copy.submit }).click();
  await expect(page.getByText(errorCopy.invalid_xdr.title)).toBeVisible();
});
