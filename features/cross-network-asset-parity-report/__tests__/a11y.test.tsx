import { describe, it } from "vitest"
import { renderFeature, screen } from "@/core/testing/render"
import { expectNoAxeViolations } from "@/core/testing/axe"
import { withMswHandlers } from "@/core/testing/msw"
import { CrossNetworkAssetParityReportPanel } from "@/features/cross-network-asset-parity-report/components/CrossNetworkAssetParityReportPanel"
import { copy } from "@/features/cross-network-asset-parity-report/copy"
import { pairsJson } from "@/features/cross-network-asset-parity-report/fixtures/normal.fixture"
import { handlers } from "@/features/cross-network-asset-parity-report/msw/handlers"

withMswHandlers(...handlers)

describe("CrossNetworkAssetParityReportPanel accessibility", () => {
  it("has no WCAG A/AA violations initially", async () => {
    const { container } = renderFeature(<CrossNetworkAssetParityReportPanel />)
    await expectNoAxeViolations(container)
  })

  it("has no WCAG A/AA violations with a report", async () => {
    const { container, user } = renderFeature(<CrossNetworkAssetParityReportPanel />)
    await user.click(screen.getByLabelText(copy.pairsLabel))
    await user.paste(pairsJson())
    await user.click(screen.getByRole("button", { name: copy.submit }))
    await screen.findByText("pair-usdc")
    await expectNoAxeViolations(container)
  })

  it("has no WCAG A/AA violations on an error", async () => {
    const { container, user } = renderFeature(<CrossNetworkAssetParityReportPanel />)
    await user.click(screen.getByRole("button", { name: copy.submit }))
    await screen.findByRole("alert")
    await expectNoAxeViolations(container)
  })
})
