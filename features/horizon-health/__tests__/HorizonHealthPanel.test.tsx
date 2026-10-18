import { expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers, http, HttpResponse } from "@/core/testing/msw";
import { horizonUrl } from "@/core/horizon/client";
import { HorizonHealthPanel } from "../components/HorizonHealthPanel";
import { copy, errorCopy } from "../copy";
import { handlers } from "../msw/handlers";
import { horizonHealthFixture } from "../fixtures/horizonHealth.fixture";
const server = withMswHandlers(...handlers);
it("renders health values and resets", async () => {
 const {user} = renderFeature(<HorizonHealthPanel/>); expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
 await user.click(screen.getByRole("button", {name: copy.submit})); expect(await screen.findByText(copy.healthy)).toBeInTheDocument(); expect(screen.getByText("998")).toBeInTheDocument();
 await user.click(screen.getByRole("button", {name: copy.reset})); expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument(); expect(screen.queryByText("998")).not.toBeInTheDocument();
});
it("keeps diagnostic values visible alongside a degraded warning", async () => {
 server.use(http.get(horizonUrl("testnet", "/"), () => HttpResponse.json({...horizonHealthFixture, core_latest_ledger: 1010})));
 const {user} = renderFeature(<HorizonHealthPanel/>); await user.click(screen.getByRole("button", {name: copy.submit})); expect(await screen.findByText(errorCopy.degraded.title)).toBeInTheDocument(); expect(screen.getByText("998")).toBeInTheDocument();
});
it("shows actionable transport failure", async () => {
 server.use(http.get(horizonUrl("testnet", "/"), () => HttpResponse.error())); const {user} = renderFeature(<HorizonHealthPanel/>); await user.click(screen.getByRole("button", {name: copy.submit})); expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.endpoint_unreachable.title);
});
