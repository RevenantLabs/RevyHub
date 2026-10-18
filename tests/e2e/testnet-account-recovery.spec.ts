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
  await page.getByLabel("Account address").fill(missingAccount);
  await page.getByRole("button", { name: "Load balances" }).click();

  await expect(page.getByText("This account does not exist on the selected network")).toBeVisible();
  await expect(page.getByText("fund a testnet account with the Testnet Faucet tool.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Testnet Faucet Helper" })).toBeVisible();

  await page.getByRole("link", { name: "Open Testnet Faucet Helper" }).click();

  await expect(page).toHaveURL("/tools/testnet-faucet");
  await expect(page.getByRole("heading", { name: "Testnet Faucet" })).toBeVisible();
  await expect(page.getByText("Fund a Stellar testnet account through Friendbot")).toBeVisible();
  expect(horizonRequests).toEqual([
    {
      method: "GET",
      pathname: `/accounts/${missingAccount}`
    }
  ]);
  expect(friendbotRequests).toBe(0);
});
