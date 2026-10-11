import { test, expect } from "@playwright/test";

test.describe("Asset Descriptor Codec", () => {
  test("converts native XLM", async ({ page }) => {
    await page.goto("/tools/asset-descriptor-codec");
    await expect(page.getByText("No asset converted yet")).toBeVisible();

    await page.fill("textarea", "XLM");
    await page.click("button:has-text('Convert')");

    await expect(page.getByText("Asset Representation")).toBeVisible();
    await expect(page.getByText("Native (XLM)")).toBeVisible();
  });

  test("shows error for empty input", async ({ page }) => {
    await page.goto("/tools/asset-descriptor-codec");
    await page.click("button:has-text('Convert')");
    await expect(page.getByText("Enter an asset descriptor or XDR")).toBeVisible();
  });

  test("roundtrips issued asset", async ({ page }) => {
    await page.goto("/tools/asset-descriptor-codec");
    await page.fill("textarea", "USD:GAAqLv0gwyWbsYuENGvbhbN4VPEVgMFPCJIZHehXgpHiVWCkA4Xq");
    await page.click("button:has-text('Convert')");
    await expect(page.getByText("Asset Representation")).toBeVisible();
  });
});
