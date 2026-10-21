import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { LedgerHeaderDecoderPanel } from "@/features/ledger-header-decoder/components/LedgerHeaderDecoderPanel";
import { copy } from "@/features/ledger-header-decoder/copy";
import { ledgerHeaderXdr } from "@/features/ledger-header-decoder/fixtures/ledgerHeaderDecoder.fixture";

describe("ledger header decoder accessibility", () => {
  it("passes WCAG 2.1 A/AA while idle", async () => {
    const { container } = renderFeature(<LedgerHeaderDecoderPanel />);
    await expectNoAxeViolations(container);
  });
  it("passes WCAG 2.1 A/AA with a result", async () => {
    const { container, user } = renderFeature(<LedgerHeaderDecoderPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), ledgerHeaderXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);
    await expectNoAxeViolations(container);
  });
});
