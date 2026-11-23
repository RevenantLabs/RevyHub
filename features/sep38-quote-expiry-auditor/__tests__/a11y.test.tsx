import { describe, it } from "vitest"
import { renderFeature, screen } from "@/core/testing/render"
import { expectNoAxeViolations } from "@/core/testing/axe"
import { Sep38QuoteExpiryAuditorPanel } from "@/features/sep38-quote-expiry-auditor/components/Sep38QuoteExpiryAuditorPanel"
import { copy } from "@/features/sep38-quote-expiry-auditor/copy"
import { ANCHOR_ID, EVALUATION_TIME, quoteJson } from "@/features/sep38-quote-expiry-auditor/fixtures/normal.fixture"

describe("Sep38QuoteExpiryAuditorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<Sep38QuoteExpiryAuditorPanel />)
    await expectNoAxeViolations(container)
  })

  it("has no WCAG A/AA violations with a quote on screen", async () => {
    const { container, user } = renderFeature(<Sep38QuoteExpiryAuditorPanel />)
    await user.click(screen.getByLabelText(copy.anchorLabel))
    await user.paste(ANCHOR_ID)
    await user.click(screen.getByLabelText(copy.evaluationLabel))
    await user.paste(EVALUATION_TIME)
    await user.click(screen.getByLabelText(copy.quoteLabel))
    await user.paste(quoteJson())
    await user.click(screen.getByRole("button", { name: copy.submit }))
    await screen.findByText("quote-100")
    await expectNoAxeViolations(container)
  })

  it("has no WCAG A/AA violations while showing an error", async () => {
    const { container, user } = renderFeature(<Sep38QuoteExpiryAuditorPanel />)
    await user.click(screen.getByRole("button", { name: copy.submit }))
    await screen.findByRole("alert")
    await expectNoAxeViolations(container)
  })
})
