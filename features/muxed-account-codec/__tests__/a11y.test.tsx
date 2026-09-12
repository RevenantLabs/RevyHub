import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { MuxedAccountCodecPanel } from "@/features/muxed-account-codec/components/MuxedAccountCodecPanel";
import { copy } from "@/features/muxed-account-codec/copy";
import {
  maxUint64Id,
  muxedAddressSmallId,
  validBaseAddress1
} from "@/features/muxed-account-codec/fixtures/muxedAccountCodec.fixture";

describe("MuxedAccountCodecPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial idle state", async () => {
    const { container } = renderFeature(<MuxedAccountCodecPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a decoded result on screen", async () => {
    const { container, user } = renderFeature(<MuxedAccountCodecPanel />);

    await user.type(screen.getByLabelText(copy.decodeAddressLabel), muxedAddressSmallId);
    await user.click(screen.getByRole("button", { name: copy.submitDecode }));
    await screen.findByText(copy.resultSummaryDecode);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with an encoded result on screen", async () => {
    const { container, user } = renderFeature(<MuxedAccountCodecPanel />);

    await user.click(screen.getByLabelText(copy.modeEncode));
    await user.type(screen.getByLabelText(copy.baseAddressLabel), validBaseAddress1);
    await user.type(screen.getByLabelText(copy.idLabel), maxUint64Id);
    await user.click(screen.getByRole("button", { name: copy.submitEncode }));
    await screen.findByText(copy.resultSummaryEncode);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while reporting a validation error", async () => {
    const { container, user } = renderFeature(<MuxedAccountCodecPanel />);

    await user.click(screen.getByRole("button", { name: copy.submitDecode }));
    await screen.findByRole("alert");

    await expectNoAxeViolations(container);
  });
});
