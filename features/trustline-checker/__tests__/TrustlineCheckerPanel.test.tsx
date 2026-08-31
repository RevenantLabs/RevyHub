import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { TrustlineCheckerPanel } from "@/features/trustline-checker/components/TrustlineCheckerPanel";
import { copy, errorCopy } from "@/features/trustline-checker/copy";
import { handlers, wrongIssuerHandler } from "@/features/trustline-checker/msw/handlers";
import {
  accountId,
  issuerId
} from "@/features/trustline-checker/fixtures/trustlineChecker.fixture";

const server = withMswHandlers(...handlers);

async function fill(user: ReturnType<typeof renderFeature>["user"], code = "USDC") {
  await user.type(screen.getByLabelText(copy.accountLabel), accountId);
  await user.type(screen.getByLabelText(copy.assetCodeLabel), code);
  await user.type(screen.getByLabelText(copy.issuerLabel), issuerId);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("TrustlineCheckerPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<TrustlineCheckerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("reports a found trustline with its limit", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<TrustlineCheckerPanel />);
    await fill(user);

    expect(await screen.findByText(copy.foundTitle)).toBeInTheDocument();
    expect(screen.getByText(/no practical limit/i)).toBeInTheDocument();
  });

  it("suggests the real issuer when the issuer is wrong", async () => {
    server.use(wrongIssuerHandler);
    resetHorizonClients();
    const { user } = renderFeature(<TrustlineCheckerPanel />);
    await fill(user);

    expect(await screen.findByText(copy.missingTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.otherIssuersTitle)).toBeInTheDocument();
  });

  it("marks the specific field that failed validation", async () => {
    const { user } = renderFeature(<TrustlineCheckerPanel />);

    await user.type(screen.getByLabelText(copy.accountLabel), "nope");
    await user.type(screen.getByLabelText(copy.assetCodeLabel), "USDC");
    await user.type(screen.getByLabelText(copy.issuerLabel), issuerId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_account.title)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.accountLabel)).toHaveAttribute("aria-invalid", "true");
    // The banner is suppressed for field errors, so exactly one alert is announced.
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });
});
