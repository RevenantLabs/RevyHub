import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { LedgerHeaderDecoderPanel } from "@/features/ledger-header-decoder/components/LedgerHeaderDecoderPanel";
import { copy, errorCopy } from "@/features/ledger-header-decoder/copy";
import { ledgerHeaderXdr } from "@/features/ledger-header-decoder/fixtures/ledgerHeaderDecoder.fixture";
import { headerWithUpgradeXdr } from "@/features/ledger-header-decoder/fixtures/header-with-upgrade.fixture";
import { Keypair } from "@stellar/stellar-sdk";

describe("LedgerHeaderDecoderPanel", () => {
  it("shows guidance before interaction and an actionable error", async () => {
    const { user } = renderFeature(<LedgerHeaderDecoderPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.empty_xdr.title)).toBeInTheDocument();
  });
  it("renders individually labeled fields", async () => {
    const { user } = renderFeature(<LedgerHeaderDecoderPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), ledgerHeaderXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getByText("123456")).toBeInTheDocument();
    expect(screen.getByText("100 stroops")).toBeInTheDocument();
    expect(screen.getByText(copy.noUpgrades)).toBeInTheDocument();
  });
  it("shows raw bytes of unknown upgrades", async () => {
    const { user } = renderFeature(<LedgerHeaderDecoderPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), headerWithUpgradeXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText("0000006312345678")).toBeInTheDocument();
  });
  it("does not retain or echo a pasted secret seed", async () => {
    const seed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 7)).secret();
    const { container, user } = renderFeature(<LedgerHeaderDecoderPanel />);
    await user.click(screen.getByLabelText(copy.formLabel));
    await user.paste(seed);
    expect(container.textContent).not.toContain(seed);
    expect(screen.getByLabelText(copy.formLabel)).not.toHaveValue(seed);
    expect(await screen.findByText(errorCopy.invalid_xdr.title)).toBeInTheDocument();
  });
});
