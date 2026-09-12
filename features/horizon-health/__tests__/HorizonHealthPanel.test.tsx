import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { HorizonHealthPanel } from "@/features/horizon-health/components/HorizonHealthPanel";
import { copy, errorCopy } from "@/features/horizon-health/copy";
import {
  degradedHandler,
  handlers,
  malformedHandler,
  noRateLimitHandler,
  unreachableHandler
} from "@/features/horizon-health/msw/handlers";

const server = withMswHandlers(...handlers);

describe("HorizonHealthPanel", () => {
  it("shows the empty state prior to running diagnostic", () => {
    renderFeature(<HorizonHealthPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("reports a healthy endpoint with full metrics and rate limits", async () => {
    const { user } = renderFeature(<HorizonHealthPanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.healthyTitle)).toBeInTheDocument();
    expect(screen.getAllByText("4,634,661").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("0 ledgers (in sync)")).toBeInTheDocument();
    expect(screen.getByText("128 – 4,634,661")).toBeInTheDocument();
    expect(screen.getAllByText(/28\.0\.1/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/3600 requests/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.refresh })).toBeInTheDocument();
  });

  it("surfaces degraded warning while preserving all diagnostic figures", async () => {
    server.use(degradedHandler);
    const { user } = renderFeature(<HorizonHealthPanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.degraded.title)).toBeInTheDocument();
    expect(screen.getByText("4,634,661")).toBeInTheDocument();
    expect(screen.getByText("4,634,650")).toBeInTheDocument();
    expect(screen.getByText("11 ledgers behind")).toBeInTheDocument();
    expect(screen.getByText("Degraded")).toBeInTheDocument();
  });

  it("reports absent rate-limit headers when not provided by endpoint", async () => {
    server.use(noRateLimitHandler);
    const { user } = renderFeature(<HorizonHealthPanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.healthyTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.rateLimitAbsent)).toBeInTheDocument();
  });

  it("explains unreachable endpoint error and next actions", async () => {
    server.use(unreachableHandler);
    const { user } = renderFeature(<HorizonHealthPanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.endpoint_unreachable.title)).toBeInTheDocument();
    expect(screen.getByText(errorCopy.endpoint_unreachable.description)).toBeInTheDocument();
  });

  it("explains malformed response error and next actions", async () => {
    server.use(malformedHandler);
    const { user } = renderFeature(<HorizonHealthPanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.unexpected_response.title)).toBeInTheDocument();
    expect(screen.getByText(errorCopy.unexpected_response.description)).toBeInTheDocument();
  });
});
