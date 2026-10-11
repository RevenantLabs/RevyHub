import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { MultisigAnalyzerPanel } from "@/features/multisig-analyzer/components/MultisigAnalyzerPanel";
import { copy } from "@/features/multisig-analyzer/copy";
import { buildTestEnvelope, sourceAccountId, transactionSourceAccountId } from "@/features/multisig-analyzer/fixtures/multisigAnalyzer.fixture";
import { handlers } from "@/features/multisig-analyzer/msw/handlers";

withMswHandlers(...handlers);

describe("MultisigAnalyzerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<MultisigAnalyzerPanel />);
    await expectNoAxeViolations(container);
  });
});
