import { expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { LedgerLookupPanel } from "../components/LedgerLookupPanel";
import { copy, errorCopy } from "../copy";
import { handlers } from "../msw/handlers";
withMswHandlers(...handlers);
it("validates input, displays a ledger and clears stale results on edits and reset", async () => {
 resetHorizonClients(); const {user} = renderFeature(<LedgerLookupPanel/>); expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument(); await user.click(screen.getByRole("button",{name:copy.submit})); expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.empty_input.title);
 await user.type(screen.getByLabelText(copy.formLabel),"900"); await user.click(screen.getByRole("button",{name:copy.submit})); expect(await screen.findByText("900719925.4740993")).toBeInTheDocument();
 await user.type(screen.getByLabelText(copy.formLabel),"1"); expect(screen.queryByText("900719925.4740993")).not.toBeInTheDocument(); await user.click(screen.getByRole("button",{name:copy.reset})); expect(screen.getByLabelText(copy.formLabel)).toHaveValue("");
});
it("includes current height for a future ledger", async () => {resetHorizonClients(); const {user} = renderFeature(<LedgerLookupPanel/>); await user.type(screen.getByLabelText(copy.formLabel),"1001"); await user.click(screen.getByRole("button",{name:copy.submit})); expect(await screen.findByRole("alert")).toHaveTextContent("1000");});
