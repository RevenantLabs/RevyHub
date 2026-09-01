import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { PaymentQrPanel } from "@/features/payment-qr/components/PaymentQrPanel";
import { copy, errorCopy } from "@/features/payment-qr/copy";
import {
  destination,
  issuer,
  memoOverByteLimit
} from "@/features/payment-qr/fixtures/paymentQr.fixture";

describe("PaymentQrPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<PaymentQrPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders a QR image and the URI for a valid request", async () => {
    const { user } = renderFeature(<PaymentQrPanel />);

    await user.type(screen.getByLabelText(copy.destinationLabel), destination);
    await user.type(screen.getByLabelText(copy.amountLabel), "10.5");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("img", { name: copy.qrAlt })).toBeInTheDocument();
    expect(screen.getByText(/web\+stellar:pay\?/)).toBeInTheDocument();
  });

  it("reveals the issuer fields only for an issued asset", async () => {
    const { user } = renderFeature(<PaymentQrPanel />);

    expect(screen.queryByLabelText(copy.assetCodeLabel)).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(copy.assetKindLabel), "issued");
    expect(screen.getByLabelText(copy.assetCodeLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.assetIssuerLabel)).toBeInTheDocument();
  });

  it("builds an issued-asset request end to end", async () => {
    const { user } = renderFeature(<PaymentQrPanel />);

    await user.type(screen.getByLabelText(copy.destinationLabel), destination);
    await user.type(screen.getByLabelText(copy.amountLabel), "25");
    await user.selectOptions(screen.getByLabelText(copy.assetKindLabel), "issued");
    await user.type(screen.getByLabelText(copy.assetCodeLabel), "usdc");
    await user.type(screen.getByLabelText(copy.assetIssuerLabel), issuer);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("img", { name: copy.qrAlt })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`USDC:${issuer}`))).toBeInTheDocument();
  });

  it("marks the memo field when the memo exceeds the byte limit", async () => {
    const { user } = renderFeature(<PaymentQrPanel />);

    await user.type(screen.getByLabelText(copy.destinationLabel), destination);
    await user.type(screen.getByLabelText(copy.amountLabel), "1");
    await user.type(screen.getByLabelText(copy.memoLabel), memoOverByteLimit);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.memo_too_long.title)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.memoLabel)).toHaveAttribute("aria-invalid", "true");
  });

  it("renders live byte and character counters that update on input", async () => {
    const { user } = renderFeature(<PaymentQrPanel />);

    expect(screen.getByText(copy.memoCounter(0))).toBeInTheDocument();
    expect(screen.getByText(copy.msgCounter(0))).toBeInTheDocument();

    const memoInput = screen.getByLabelText(copy.memoLabel);
    await user.type(memoInput, "Hello");
    expect(screen.getByText(copy.memoCounter(5))).toBeInTheDocument();

    // Multibyte UTF-8 characters (emoji = 4 bytes)
    await user.clear(memoInput);
    await user.type(memoInput, "🚀");
    expect(screen.getByText(copy.memoCounter(4))).toBeInTheDocument();

    const msgInput = screen.getByLabelText(copy.msgLabel);
    await user.type(msgInput, "Thanks for coffee!");
    expect(screen.getByText(copy.msgCounter(18))).toBeInTheDocument();
  });
});
