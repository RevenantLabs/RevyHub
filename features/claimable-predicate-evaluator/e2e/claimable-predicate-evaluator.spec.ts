import { test, expect } from "@playwright/test";
import { claimantA, balanceJson, deadline } from "../fixtures/normal.fixture";
import { relativeBalance, malformedUnion } from "../fixtures/boundary.fixture";

test("complete, incomplete, and malformed offline evaluations", async ({ page }) => {
  await page.goto("/tools/claimable-predicate-evaluator");
  await expect(page.getByText("No evaluation yet")).toBeVisible();
  await page.getByLabel("Pasted balance or predicate").fill(balanceJson);
  await page.getByLabel("Claimant address").fill(claimantA);
  await page.getByLabel("Evaluation time (UTC)").fill(deadline);
  await page.getByRole("button", { name: "Evaluate predicate" }).click();
  await expect(page.getByText("Predicate evaluated from the supplied evidence.", { exact: false })).toBeVisible();
  await page.screenshot({ path: "features/claimable-predicate-evaluator/e2e/screenshots/desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "features/claimable-predicate-evaluator/e2e/screenshots/mobile.png", fullPage: true });
  await page.getByLabel("Pasted balance or predicate").fill(relativeBalance);
  await page.getByRole("button", { name: "Evaluate predicate" }).click();
  await expect(page.getByText("Evidence incomplete")).toBeVisible();
  await expect(page.getByText(`${claimantA}: Unknown`)).toBeVisible();
  await page.getByLabel("Pasted balance or predicate").fill(malformedUnion);
  await page.getByRole("button", { name: "Evaluate predicate" }).click();
  await expect(page.getByRole("alert")).toContainText("Malformed data");
});
