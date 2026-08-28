import { describe, expect, it } from "vitest";
import { resetHorizonClients } from "@/core/horizon/client";
import { renderFeature, screen, within } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { AccountSignersPanel } from "@/features/account-signers/components/AccountSignersPanel";
import { copy, errorCopy } from "@/features/account-signers/copy";
import { handlers } from "@/features/account-signers/msw/handlers";
import {
  accountId,
  normalAccountId,
  unknownAccountId
} from "@/features/account-signers/fixtures/accountSigners.fixture";

withMswHandlers(...handlers);

async function inspect(address: string) {
  resetHorizonClients();
  const rendered = renderFeature(<AccountSignersPanel />);
  await rendered.user.type(screen.getByLabelText(copy.formLabel), address);
  await rendered.user.click(screen.getByRole("button", { name: copy.submit }));
  return rendered;
}

describe("AccountSignersPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<AccountSignersPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders every signer type with its key and weight", async () => {
    await inspect(accountId);
    const signerTable = await screen.findByRole("table", {
      name: copy.signerTableCaption(accountId)
    });
    const signerRows = within(signerTable).getAllByRole("row").slice(1);

    expect(signerRows).toHaveLength(5);
    for (const type of [
      "ed25519_public_key",
      "sha256_hash",
      "preauth_tx",
      "ed25519_signed_payload"
    ]) {
      expect(within(signerTable).getAllByText(type).length).toBeGreaterThan(0);
    }
    expect(within(signerTable).getByText(copy.masterKeyLabel)).toBeInTheDocument();
    expect(within(signerTable).getByText(copy.disabledLabel)).toBeInTheDocument();
  });

  it("explains each threshold gate and flags an unreachable threshold", async () => {
    await inspect(accountId);
    const thresholdTable = await screen.findByRole("table", {
      name: copy.thresholdTableCaption(accountId)
    });

    for (const level of ["low", "medium", "high"] as const) {
      expect(within(thresholdTable).getByText(copy.thresholdLabels[level])).toBeInTheDocument();
      expect(within(thresholdTable).getByText(copy.thresholdDescriptions[level])).toBeInTheDocument();
    }
    expect(within(thresholdTable).getByText(copy.thresholdUnreachableLabel)).toBeInTheDocument();
    expect(
      within(thresholdTable).getByText(copy.thresholdUnreachableDescription)
    ).toBeInTheDocument();
  });

  it("calls out a disabled master key plainly", async () => {
    await inspect(accountId);
    expect(await screen.findByText(copy.masterDisabledTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.masterDisabledDescription)).toBeInTheDocument();
  });

  it("describes a default single-signer setup as non-multisig", async () => {
    await inspect(normalAccountId);
    expect(await screen.findByText(copy.normalAccountTitle)).toBeInTheDocument();
    expect(screen.getAllByText(copy.normalAccountDescription).length).toBeGreaterThan(0);
  });

  it("shows a field error for invalid input", async () => {
    const { user } = renderFeature(<AccountSignersPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), "GNOPE");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.invalid_address.title)).toHaveAttribute(
      "role",
      "alert"
    );
  });

  it("never renders secret-key input in result or error text", async () => {
    const secret = `S${"A".repeat(55)}`;
    const { user, container } = renderFeature(<AccountSignersPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), secret);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secret);
  });

  it("explains an account missing from the selected network", async () => {
    await inspect(unknownAccountId);
    expect(await screen.findByText(errorCopy.account_not_found.title)).toBeInTheDocument();
  });
});
