import { test, expect } from "@playwright/test";
import { feeBumpXdr } from "@/features/signing-payload-inspector/fixtures/fee-bump-envelope.fixture";
import { copy } from "@/features/signing-payload-inspector/copy";

test("shows separate outer and inner fee-bump signing hashes", async ({ page }) => {
  await page.goto("/tools/signing-payload-inspector");
  await page.getByLabel(copy.formLabel).fill(feeBumpXdr);
  await page.getByRole("button", { name: copy.submit }).click();
  await expect(page.getByText(copy.outerTitle)).toBeVisible();
  await expect(page.getByText(copy.innerTitle)).toBeVisible();
  await expect(page.getByText(copy.feeBumpNote)).toBeVisible();
  const hashes = await page.getByTestId("payload-hash").allTextContents();
  expect(hashes).toHaveLength(2);
  expect(hashes[0]).toMatch(/^[0-9a-f]{64}$/);
  expect(hashes[1]).toMatch(/^[0-9a-f]{64}$/);
  expect(hashes[0]).not.toBe(hashes[1]);
});
