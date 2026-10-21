import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { TxrepConverterPanel } from "@/features/txrep-converter/components/TxrepConverterPanel";
import { copy } from "@/features/txrep-converter/copy";
import { sampleEnvelope } from "@/features/txrep-converter/fixtures/sample-envelope.fixture";

describe("TxrepConverterPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TxrepConverterPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations after a conversion", async () => {
    const { container, user } = renderFeature(<TxrepConverterPanel />);
    await user.click(screen.getByLabelText(copy.inputLabel));
    await user.paste(sampleEnvelope);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);
    await expectNoAxeViolations(container);
  });
});
