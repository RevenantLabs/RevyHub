import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { AssetStatisticsPanel } from "@/features/asset-statistics/components/AssetStatisticsPanel";
import { handlers } from "@/features/asset-statistics/msw/handlers";

const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("AssetStatisticsPanel", () => {
  it("renders empty state initially", () => {
    render(<AssetStatisticsPanel />, { wrapper: NetworkProvider });
    expect(screen.getByText("No asset checked yet")).toBeInTheDocument();
  });

  it("submits and shows results", async () => {
    render(<AssetStatisticsPanel />, { wrapper: NetworkProvider });
    
    fireEvent.change(screen.getByLabelText("Asset code"), { target: { value: "USDC" } });
    fireEvent.change(screen.getByLabelText("Issuer address"), { target: { value: "GBBD47IF6LWK7P7MDEVSCWTTCJM4NUIQ35M4MPMHEUEH9DMB2UCA36GZ" } });
    fireEvent.click(screen.getByRole("button", { name: "Check statistics" }));
    
    expect(await screen.findByText("Asset Statistics")).toBeInTheDocument();
  });
});
