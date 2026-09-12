import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { MuxedAccountCodecPanel } from "@/features/muxed-account-codec/components/MuxedAccountCodecPanel";
import { copy, errorCopy } from "@/features/muxed-account-codec/copy";
import {
  invalidMuxedAddress,
  maxUint64Id,
  muxedAddressMaxId,
  muxedAddressSmallId,
  secretSeed,
  smallId,
  validBaseAddress1
} from "@/features/muxed-account-codec/fixtures/muxedAccountCodec.fixture";

describe("MuxedAccountCodecPanel", () => {
  it("shows the empty state before any conversion is submitted", () => {
    renderFeature(<MuxedAccountCodecPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("decodes an M-address and renders its base address, ID, and relationship explanation", async () => {
    const { user } = renderFeature(<MuxedAccountCodecPanel />);

    await user.type(screen.getByLabelText(copy.decodeAddressLabel), muxedAddressSmallId);
    await user.click(screen.getByRole("button", { name: copy.submitDecode }));

    expect(await screen.findByText(copy.resultSummaryDecode)).toBeInTheDocument();
    expect(screen.getByText(validBaseAddress1)).toBeInTheDocument();
    expect(screen.getAllByText(smallId).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(copy.explanationTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.explanationText)).toBeInTheDocument();
  });

  it("encodes a G-address and max uint64 ID into an M-address", async () => {
    const { user } = renderFeature(<MuxedAccountCodecPanel />);

    await user.click(screen.getByLabelText(copy.modeEncode));
    await user.type(screen.getByLabelText(copy.baseAddressLabel), validBaseAddress1);
    await user.type(screen.getByLabelText(copy.idLabel), maxUint64Id);
    await user.click(screen.getByRole("button", { name: copy.submitEncode }));

    expect(await screen.findByText(copy.resultSummaryEncode)).toBeInTheDocument();
    expect(screen.getByText(muxedAddressMaxId)).toBeInTheDocument();
    expect(screen.getByText(maxUint64Id)).toBeInTheDocument();
  });

  it("shows an error when submitted empty", async () => {
    const { user } = renderFeature(<MuxedAccountCodecPanel />);

    await user.click(screen.getByRole("button", { name: copy.submitDecode }));

    expect(await screen.findByText(errorCopy.empty_input.title)).toBeInTheDocument();
    expect(screen.getByText(errorCopy.empty_input.description)).toBeInTheDocument();
  });

  it("shows an error for invalid M-address", async () => {
    const { user } = renderFeature(<MuxedAccountCodecPanel />);

    await user.type(screen.getByLabelText(copy.decodeAddressLabel), invalidMuxedAddress);
    await user.click(screen.getByRole("button", { name: copy.submitDecode }));

    expect(await screen.findByText(errorCopy.invalid_muxed_address.title)).toBeInTheDocument();
  });

  it("shows an error for invalid ID in encode mode", async () => {
    const { user } = renderFeature(<MuxedAccountCodecPanel />);

    await user.click(screen.getByLabelText(copy.modeEncode));
    await user.type(screen.getByLabelText(copy.baseAddressLabel), validBaseAddress1);
    await user.type(screen.getByLabelText(copy.idLabel), "-1");
    await user.click(screen.getByRole("button", { name: copy.submitEncode }));

    expect(await screen.findByText(errorCopy.invalid_id.title)).toBeInTheDocument();
  });

  it("rejects secret seed in decode mode and never leaks it into DOM", async () => {
    const { user, container } = renderFeature(<MuxedAccountCodecPanel />);

    await user.type(screen.getByLabelText(copy.decodeAddressLabel), secretSeed);
    await user.click(screen.getByRole("button", { name: copy.submitDecode }));

    expect(await screen.findByText(errorCopy.invalid_muxed_address.title)).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });

  it("rejects secret seed in encode mode and never leaks it into DOM", async () => {
    const { user, container } = renderFeature(<MuxedAccountCodecPanel />);

    await user.click(screen.getByLabelText(copy.modeEncode));
    await user.type(screen.getByLabelText(copy.baseAddressLabel), secretSeed);
    await user.type(screen.getByLabelText(copy.idLabel), smallId);
    await user.click(screen.getByRole("button", { name: copy.submitEncode }));

    expect(await screen.findByText(errorCopy.invalid_base_address.title)).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });
});
