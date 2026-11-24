import { describe, expect, it } from "vitest"
import { renderFeature, screen } from "@/core/testing/render"
import { withMswHandlers } from "@/core/testing/msw"
import { CrossNetworkAssetParityReportPanel } from "@/features/cross-network-asset-parity-report/components/CrossNetworkAssetParityReportPanel"
import { copy, errorCopy } from "@/features/cross-network-asset-parity-report/copy"
import { missingSidePair } from "@/features/cross-network-asset-parity-report/fixtures/boundary.fixture"
import { pairsJson } from "@/features/cross-network-asset-parity-report/fixtures/normal.fixture"
import { handlers } from "@/features/cross-network-asset-parity-report/msw/handlers"

withMswHandlers(...handlers)

async function submit(user: ReturnType<typeof renderFeature>["user"], json: string) {
  await user.click(screen.getByLabelText(copy.pairsLabel))
  await user.paste(json)
  await user.click(screen.getByRole("button", { name: copy.submit }))
}

describe("CrossNetworkAssetParityReportPanel", () => {
  it("renders the empty state first", () => {
    renderFeature(<CrossNetworkAssetParityReportPanel />)
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument()
  })

  it("shows an error when submitted empty", async () => {
    const { user } = renderFeature(<CrossNetworkAssetParityReportPanel />)
    await user.click(screen.getByRole("button", { name: copy.submit }))
    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.empty_input.title)
  })

  it("shows a home-domain difference for an explicit pair", async () => {
    const { user } = renderFeature(<CrossNetworkAssetParityReportPanel />)
    await submit(user, pairsJson())
    expect(await screen.findByText("pair-usdc")).toBeInTheDocument()
    expect(screen.getByText(/home_domain: different/)).toBeInTheDocument()
  })

  it("shows a missing side as a partial report", async () => {
    const { user } = renderFeature(<CrossNetworkAssetParityReportPanel />)
    await submit(user, missingSidePair)
    expect(await screen.findByText(copy.partialTitle)).toBeInTheDocument()
  })
})
