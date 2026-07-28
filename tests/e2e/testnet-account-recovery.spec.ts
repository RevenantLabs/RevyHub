import { expect, test } from "@playwright/test";

const missingAccount = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

test("guides an unfunded testnet account from Balance Viewer to Friendbot", async ({ page }) => {
  const horizonRequests: Array<{ method: string; pathname: string }> = [];
  let friendbotRequests = 0;

  await page.route("https://horizon-testnet.stellar.org/**", async (route) => {
    const request = route.request();
    horizonRequests.push({
      method: request.method(),
      pathname: new URL(request.url()).pathname
    });
    await route.fulfill({
      status: 404,
      contentType: "application/hal+json",
      headers: {
        "access-control-allow-origin": "*"
      },
      body: JSON.stringify({
        status: 404,
        title: "Resource Missing",
        detail: "The resource at the url requested was not found."
      })
    });
  });
  await page.route("https://friendbot.stellar.org/**", async (route) => {
    friendbotRequests += 1;
    await route.abort();
  });

  await page.goto("/tools/balance-viewer");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Stellar public address").fill(missingAccount);
  await page.getByRole("button", { name: "Open moon wallet" }).click();

  await expect(page.getByText("Account not found on Stellar testnet. Fund it with Friendbot first.")).toBeVisible();
  await expect(page.getByText("Create the testnet account", { exact: true })).toBeVisible();
  await expect(page.getByText("Testnet accounts only exist after they receive testnet XLM.")).toBeVisible();

  await page.getByRole("link", { name: "Open Testnet Faucet Helper" }).click();

  await expect(page).toHaveURL("/tools/testnet-faucet");
  await expect(page.getByRole("heading", { name: "Testnet Faucet Helper" })).toBeVisible();
  await expect(page.getByText("The faucet helper pours testnet XLM only. No real funds are involved.")).toBeVisible();
  expect(horizonRequests).toEqual([
    {
      method: "GET",
      pathname: `/accounts/${missingAccount}`
    }
  ]);
  expect(friendbotRequests).toBe(0);
});
