import { describe, it } from "vitest"
import { renderFeature, screen } from "@/core/testing/render"
import { expectNoAxeViolations } from "@/core/testing/axe"
import { Sep6CapabilityEvidenceAuditorPanel } from "@/features/sep6-capability-evidence-auditor/components/Sep6CapabilityEvidenceAuditorPanel"
import { copy } from "@/features/sep6-capability-evidence-auditor/copy"
import { ANCHOR_URL, infoJson } from "@/features/sep6-capability-evidence-auditor/fixtures/normal.fixture"

describe("Sep6CapabilityEvidenceAuditorPanel accessibility", () => {
  it("has no WCAG A/AA violations initially", async () => {
    const { container } = renderFeature(<Sep6CapabilityEvidenceAuditorPanel />)
    await expectNoAxeViolations(container)
  })

  it("has no WCAG A/AA violations with a result", async () => {
    const { container, user } = renderFeature(<Sep6CapabilityEvidenceAuditorPanel />)
    await user.click(screen.getByLabelText(copy.anchorLabel))
    await user.paste(ANCHOR_URL)
    await user.click(screen.getByLabelText(copy.infoLabel))
    await user.paste(infoJson())
    await user.click(screen.getByRole("button", { name: copy.submit }))
    await screen.findByText("deposit / USD")
    await expectNoAxeViolations(container)
  })

  it("has no WCAG A/AA violations on an error", async () => {
    const { container, user } = renderFeature(<Sep6CapabilityEvidenceAuditorPanel />)
    await user.click(screen.getByRole("button", { name: copy.submit }))
    await screen.findByRole("alert")
    await expectNoAxeViolations(container)
  })
})
