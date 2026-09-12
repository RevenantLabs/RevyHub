import { describe, expect, it } from "vitest";
import { fireEvent, renderFeature, screen } from "@/core/testing/render";
import { HashCalculatorPanel } from "@/features/hash-calculator/components/HashCalculatorPanel";
import { copy, errorCopy } from "@/features/hash-calculator/copy";
import {
  expectedPublicHashHex,
  expectedTestnetHashHex,
  invalidHexOdd,
  invalidXdrString,
  secretKey,
  textVector,
  validEnvelopeXdr
} from "@/features/hash-calculator/fixtures/hashCalculator.fixture";

describe("HashCalculatorPanel", () => {
  it("shows the empty state initially", () => {
    renderFeature(<HashCalculatorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("computes SHA-256 for utf8 text and renders copyable outputs", async () => {
    const { user } = renderFeature(<HashCalculatorPanel />);

    const textarea = screen.getByLabelText(copy.dataLabel);
    await user.type(textarea, textVector.input);

    const submit = screen.getByRole("button", { name: copy.submit });
    await user.click(submit);

    expect(await screen.findByText(textVector.expectedHex)).toBeInTheDocument();
    expect(screen.getByText(textVector.expectedBase64)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Copy ${copy.copyHexLabel}` })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Copy ${copy.copyBase64Label}` })
    ).toBeInTheDocument();
  });

  it("computes transaction hash and provides one-click passphrase switching", async () => {
    const { user } = renderFeature(<HashCalculatorPanel />);

    const modeSelect = screen.getByLabelText(copy.formModeLabel);
    fireEvent.change(modeSelect, { target: { value: "transaction" } });

    const envelopeInput = screen.getByLabelText(copy.envelopeLabel);
    fireEvent.change(envelopeInput, { target: { value: validEnvelopeXdr } });

    const submit = screen.getByRole("button", { name: copy.submit });
    await user.click(submit);

    const testnetHashes = await screen.findAllByText(expectedTestnetHashHex);
    expect(testnetHashes.length).toBeGreaterThan(0);
    expect(screen.getByText(copy.comparisonTitle)).toBeInTheDocument();

    const switchToPublicBtn = screen.getByRole("button", { name: copy.switchToPublic });
    await user.click(switchToPublicBtn);

    const publicHashes = await screen.findAllByText(expectedPublicHashHex);
    expect(publicHashes.length).toBeGreaterThan(0);
  });

  it("displays actionable error for empty input", async () => {
    const { user } = renderFeature(<HashCalculatorPanel />);

    const submit = screen.getByRole("button", { name: copy.submit });
    await user.click(submit);

    expect(await screen.findByText(errorCopy.empty_input.title)).toBeInTheDocument();
    expect(screen.getByText(errorCopy.empty_input.description)).toBeInTheDocument();
  });

  it("displays actionable error for invalid hex encoding", async () => {
    const { user } = renderFeature(<HashCalculatorPanel />);

    const encodingSelect = screen.getByLabelText(copy.encodingLabel);
    fireEvent.change(encodingSelect, { target: { value: "hex" } });

    const dataInput = screen.getByLabelText(copy.dataLabel);
    await user.type(dataInput, invalidHexOdd);

    const submit = screen.getByRole("button", { name: copy.submit });
    await user.click(submit);

    expect(await screen.findByText(errorCopy.invalid_encoding.title)).toBeInTheDocument();
  });

  it("displays actionable error for invalid transaction envelope", async () => {
    const { user } = renderFeature(<HashCalculatorPanel />);

    const modeSelect = screen.getByLabelText(copy.formModeLabel);
    fireEvent.change(modeSelect, { target: { value: "transaction" } });

    const envelopeInput = screen.getByLabelText(copy.envelopeLabel);
    await user.type(envelopeInput, invalidXdrString);

    const submit = screen.getByRole("button", { name: copy.submit });
    await user.click(submit);

    expect(await screen.findByText(errorCopy.invalid_xdr.title)).toBeInTheDocument();
  });

  it("never echoes a secret key back to the rendered page", async () => {
    const { user } = renderFeature(<HashCalculatorPanel />);

    const modeSelect = screen.getByLabelText(copy.formModeLabel);
    fireEvent.change(modeSelect, { target: { value: "transaction" } });

    const envelopeInput = screen.getByLabelText(copy.envelopeLabel);
    fireEvent.change(envelopeInput, { target: { value: secretKey } });

    const submit = screen.getByRole("button", { name: copy.submit });
    await user.click(submit);

    expect(await screen.findByText(errorCopy.invalid_xdr.title)).toBeInTheDocument();
    expect(screen.queryByText(secretKey)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain(secretKey);
  });
});
