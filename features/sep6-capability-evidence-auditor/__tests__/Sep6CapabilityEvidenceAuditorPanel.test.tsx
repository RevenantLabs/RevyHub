import { describe, expect, it } from "vitest"
import { renderFeature, screen } from "@/core/testing/render"
import { Sep6CapabilityEvidenceAuditorPanel } from "@/features/sep6-capability-evidence-auditor/components/Sep6CapabilityEvidenceAuditorPanel"
import { copy, errorCopy } from "@/features/sep6-capability-evidence-auditor/copy"
import { disabledAsset } from "@/features/sep6-capability-evidence-auditor/fixtures/boundary.fixture"
import { ANCHOR_URL, infoJson } from "@/features/sep6-capability-evidence-auditor/fixtures/normal.fixture"

describe("Sep6CapabilityEvidenceAuditorPanel", () => {
  it("renders the empty state first", () => {
    renderFeature(<Sep6CapabilityEvidenceAuditorPanel />)
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument()
  })

  it("shows an error when submitted empty", async () => {
    const { user } = renderFeature(<Sep6CapabilityEvidenceAuditorPanel />)
    await user.click(screen.getByRole("button", { name: copy.submit }))
    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.empty_input.title)
  })

  it("shows a disabled asset as false, not as a missing document", async () => {
    const { user } = renderFeature(<Sep6CapabilityEvidenceAuditorPanel />)
    await user.click(screen.getByLabelText(copy.anchorLabel))
    await user.paste(ANCHOR_URL)
    await user.click(screen.getByLabelText(copy.infoLabel))
    await user.paste(infoJson(disabledAsset))
    await user.click(screen.getByRole("button", { name: copy.submit }))
    expect(await screen.findByText("deposit / USD")).toBeInTheDocument()
    expect(screen.getByText("false")).toBeInTheDocument()
  })
})
