import { describe, it } from "vitest"
import { renderFeature, screen } from "@/core/testing/render"
import { expectNoAxeViolations } from "@/core/testing/axe"
import { Sep31FieldReadinessCheckerPanel } from "@/features/sep31-field-readiness-checker/components/Sep31FieldReadinessCheckerPanel"
import { copy } from "@/features/sep31-field-readiness-checker/copy"
import { ANCHOR_ID, ASSET_CODE, fieldMapJson, requirementsJson } from "@/features/sep31-field-readiness-checker/fixtures/normal.fixture"

describe("Sep31FieldReadinessCheckerPanel accessibility", () => {
  it("has no WCAG A/AA violations initially", async () => {
    const { container } = renderFeature(<Sep31FieldReadinessCheckerPanel />)
    await expectNoAxeViolations(container)
  })

  it("has no WCAG A/AA violations with a result", async () => {
    const { container, user } = renderFeature(<Sep31FieldReadinessCheckerPanel />)
    await user.click(screen.getByLabelText(copy.anchorLabel))
    await user.paste(ANCHOR_ID)
    await user.click(screen.getByLabelText(copy.assetLabel))
    await user.paste(ASSET_CODE)
    await user.click(screen.getByLabelText(copy.requirementsLabel))
    await user.paste(requirementsJson())
    await user.click(screen.getByLabelText(copy.fieldMapLabel))
    await user.paste(fieldMapJson())
    await user.click(screen.getByRole("button", { name: copy.submit }))
    await screen.findByText("email_address")
    await expectNoAxeViolations(container)
  })

  it("has no WCAG A/AA violations on an error", async () => {
    const { container, user } = renderFeature(<Sep31FieldReadinessCheckerPanel />)
    await user.click(screen.getByRole("button", { name: copy.submit }))
    await screen.findByRole("alert")
    await expectNoAxeViolations(container)
  })
})
