import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { AmountConverterPanel } from "@/features/amount-converter/components/AmountConverterPanel";
import { copy, errorCopy } from "@/features/amount-converter/copy";
import { maxStroops, tooManyDecimals } from "@/features/amount-converter/fixtures/amountConverter.fixture";

describe("AmountConverterPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<AmountConverterPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("converts stroops to a display amount live", async () => {
    const { user } = renderFeature(<AmountConverterPanel />);

    await user.type(screen.getByLabelText(copy.stroopsLabel), "10000000");

    expect(await screen.findByText(copy.exactConversion)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.amountLabel)).toHaveValue("1.0000000");
  });

  it("converts a display amount to stroops live", async () => {
    const { user } = renderFeature(<AmountConverterPanel />);

    await user.type(screen.getByLabelText(copy.amountLabel), "0.0000001");

    expect(await screen.findByText(copy.exactConversion)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.stroopsLabel)).toHaveValue("1");
  });

  it("loads the int64 maximum with one click", async () => {
    const { user } = renderFeature(<AmountConverterPanel />);

    await user.click(screen.getByRole("button", { name: copy.maxExample }));

    expect(screen.getByLabelText(copy.stroopsLabel)).toHaveValue(maxStroops.stroops);
    expect(screen.getByLabelText(copy.amountLabel)).toHaveValue(maxStroops.amount);
  });

  it("reports precision loss for too many decimal places", async () => {
    const { user } = renderFeature(<AmountConverterPanel />);

    await user.type(screen.getByLabelText(copy.amountLabel), tooManyDecimals);

    expect(await screen.findByText(errorCopy.too_many_decimals.description)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.amountLabel)).toHaveAttribute("aria-invalid", "true");
  });

  it("clears both fields when reset is clicked", async () => {
    const { user } = renderFeature(<AmountConverterPanel />);

    await user.type(screen.getByLabelText(copy.stroopsLabel), "1");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(screen.getByLabelText(copy.stroopsLabel)).toHaveValue("");
    expect(screen.getByLabelText(copy.amountLabel)).toHaveValue("");
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });
});
