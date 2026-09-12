import { describe, it } from "vitest";
import { fireEvent, renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { HashCalculatorPanel } from "@/features/hash-calculator/components/HashCalculatorPanel";
import { copy, errorCopy } from "@/features/hash-calculator/copy";
import {
  textVector,
  validEnvelopeXdr
} from "@/features/hash-calculator/fixtures/hashCalculator.fixture";

describe("HashCalculatorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<HashCalculatorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with raw data digest on screen", async () => {
    const { container, user } = renderFeature(<HashCalculatorPanel />);

    const textarea = screen.getByLabelText(copy.dataLabel);
    await user.type(textarea, textVector.input);

    const submit = screen.getByRole("button", { name: copy.submit });
    await user.click(submit);

    await screen.findByText(copy.resultDataTitle);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with transaction hash comparison on screen", async () => {
    const { container, user } = renderFeature(<HashCalculatorPanel />);

    const modeSelect = screen.getByLabelText(copy.formModeLabel);
    fireEvent.change(modeSelect, { target: { value: "transaction" } });

    const envelopeInput = screen.getByLabelText(copy.envelopeLabel);
    fireEvent.change(envelopeInput, { target: { value: validEnvelopeXdr } });

    const submit = screen.getByRole("button", { name: copy.submit });
    await user.click(submit);

    await screen.findByText(copy.resultTxTitle);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while an error message is shown", async () => {
    const { container, user } = renderFeature(<HashCalculatorPanel />);

    const submit = screen.getByRole("button", { name: copy.submit });
    await user.click(submit);

    await screen.findByText(errorCopy.empty_input.title);
    await expectNoAxeViolations(container);
  });
});
