import { describe, expect, it } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderFeature } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { OperationResultXdrDecoderPanel } from "../components/OperationResultXdrDecoderPanel";
import { copy, errorCopy } from "../copy";
import { handlers } from "../msw/handlers";
import { partialHash } from "../fixtures/partial-failure.fixture";
withMswHandlers(...handlers);
describe("decoder panel", () => {
  it("does not keep a pasted secret-like value", () => { const { container } = renderFeature(<OperationResultXdrDecoderPanel />); const field = screen.getByRole("textbox", { name: /Transaction hash/ }); fireEvent.change(field, { target: { value: "S".repeat(56) } }); expect(field).toHaveValue(""); expect(container.textContent).not.toContain("S".repeat(56)); });
  it("renders idle, validation error, and explained operation failure", async () => { resetHorizonClients(); const { user } = renderFeature(<OperationResultXdrDecoderPanel />); expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument(); await user.type(screen.getByRole("textbox", { name: /Transaction hash/ }), "bad"); await user.click(screen.getByRole("button", { name: copy.submit })); expect(screen.getByText(errorCopy.invalid_hash.title)).toBeInTheDocument(); await user.clear(screen.getByRole("textbox", { name: /Transaction hash/ })); await user.type(screen.getByRole("textbox", { name: /Transaction hash/ }), partialHash); await user.click(screen.getByRole("button", { name: copy.submit })); await waitFor(() => expect(screen.getByText(copy.operationFailure)).toBeInTheDocument()); expect(screen.getByText("payment_underfunded")).toBeInTheDocument(); });
});
