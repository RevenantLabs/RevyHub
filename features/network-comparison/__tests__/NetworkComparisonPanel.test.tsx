import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { NetworkComparisonPanel } from "@/features/network-comparison/components/NetworkComparisonPanel";
import { copy, errorCopy } from "@/features/network-comparison/copy";
import {
  bothErrorHandler,
  handlers,
  testnetErrorHandler
} from "@/features/network-comparison/msw/handlers";

const server = withMswHandlers(...handlers);

describe("NetworkComparisonPanel", () => {
  it("shows empty state before loading", () => {
    renderFeature(<NetworkComparisonPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.networkSwitchNotice)).toBeInTheDocument();
  });

  it("loads and displays side-by-side network comparison with highlighted differences", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<NetworkComparisonPanel />);

    const button = screen.getAllByRole("button", { name: copy.submit })[0];
    await user.click(button);

    expect(await screen.findByText(copy.protocolDifferenceBadge)).toBeInTheDocument();
    expect(screen.getByText(copy.testnetColumnTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.mainnetColumnTitle)).toBeInTheDocument();
    expect(screen.getAllByText("Protocol 21")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Protocol 20")[0]).toBeInTheDocument();
    expect(screen.getByText("#1,234,567")).toBeInTheDocument();
    expect(screen.getByText("#54,321,000")).toBeInTheDocument();
    expect(screen.getByText(copy.summaryTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.testnetResetTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.testnetResetDescription)).toBeInTheDocument();
  });

  it("displays partial failure without blanking the surviving column", async () => {
    server.use(testnetErrorHandler);
    resetHorizonClients();
    const { user } = renderFeature(<NetworkComparisonPanel />);

    const button = screen.getAllByRole("button", { name: copy.submit })[0];
    await user.click(button);

    expect(await screen.findByText(errorCopy.partial_failure.title)).toBeInTheDocument();
    expect(screen.getByText(copy.mainnetColumnTitle)).toBeInTheDocument();
    expect(screen.getByText("#54,321,000")).toBeInTheDocument();
    expect(screen.getAllByText(copy.columnStatusUnreachable)[0]).toBeInTheDocument();
  });

  it("displays error message when both endpoints fail", async () => {
    server.use(...bothErrorHandler);
    resetHorizonClients();
    const { user } = renderFeature(<NetworkComparisonPanel />);

    const button = screen.getAllByRole("button", { name: copy.submit })[0];
    await user.click(button);

    expect(await screen.findByText(errorCopy.both_unreachable.title)).toBeInTheDocument();
  });

  it("never renders secret keys", () => {
    const secretKey = "SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6L6C5M4N3B2V1C0X9Z8Y7";
    renderFeature(<NetworkComparisonPanel />);
    expect(screen.queryByText(secretKey)).not.toBeInTheDocument();
  });
});
