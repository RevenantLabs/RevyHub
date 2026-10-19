import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { copy, errorCopy } from "@/features/horizon-rate-limit-monitor/copy";
import { HorizonRateLimitMonitorPanel } from "@/features/horizon-rate-limit-monitor/components/HorizonRateLimitMonitorPanel";
import { handlers, missingHandler, malformedHandler } from "@/features/horizon-rate-limit-monitor/msw/handlers";
const server = withMswHandlers(...handlers);

describe("monitor panel", () => {
  it("starts with guidance and accessible controls", () => {
    renderFeature(<HorizonRateLimitMonitorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.accountLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.thresholdLabel)).toHaveValue("10");
  });
  it("shows endpoint quota, countdown and low quota warning", async () => {
    const { user } = renderFeature(<HorizonRateLimitMonitorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    const table = await screen.findByRole("table", { name: copy.resultTitle });
    expect(table).toHaveTextContent("/ledgers");
    expect(table).toHaveTextContent(copy.lowQuotaTitle);
    expect(table).toHaveTextContent(copy.reset);
    expect(table).toHaveTextContent("2000000000");
    expect(table).toHaveTextContent(copy.resetCountdown);
    expect(table).toHaveTextContent("h ");
  });
  it("renders missing headers as an explicit outcome", async () => {
    server.use(missingHandler);
    const { user } = renderFeature(<HorizonRateLimitMonitorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    const table = await screen.findByRole("table", { name: copy.resultTitle });
    expect(table).toHaveTextContent(copy.notReported);
  });
  it("shows actionable malformed-header advice", async () => {
    server.use(malformedHandler);
    const { user } = renderFeature(<HorizonRateLimitMonitorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.missing_headers.title)).toBeInTheDocument();
  });
  it("clears and never echoes a submitted secret seed", async () => {
    const seed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 7)).secret();
    const { user, container } = renderFeature(<HorizonRateLimitMonitorPanel />);
    await user.type(screen.getByLabelText(copy.accountLabel), seed);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.invalid_account.description)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.accountLabel)).toHaveValue("");
    expect(container.textContent).not.toContain(seed);
  });
});
