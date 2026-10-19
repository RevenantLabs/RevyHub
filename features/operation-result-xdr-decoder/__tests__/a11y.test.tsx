import { describe, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { OperationResultXdrDecoderPanel } from "../components/OperationResultXdrDecoderPanel";
import { copy } from "../copy";
import { handlers } from "../msw/handlers";
import { successHash } from "../fixtures/operationResultXdrDecoder.fixture";
withMswHandlers(...handlers);
describe("WCAG 2.1 A/AA", () => {
  it("has no violations while idle", async () => { const { container } = renderFeature(<OperationResultXdrDecoderPanel />); await expectNoAxeViolations(container); });
  it("has no violations with a decoded result", async () => { resetHorizonClients(); const { container, user } = renderFeature(<OperationResultXdrDecoderPanel />); await user.type(screen.getByRole("textbox", { name: /Transaction hash/ }), successHash); await user.click(screen.getByRole("button", { name: copy.submit })); await waitFor(() => screen.getByText(copy.success)); await expectNoAxeViolations(container); });
});
