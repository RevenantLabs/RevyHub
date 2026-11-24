import { describe, expect, it } from "vitest"
import { renderFeature, screen } from "@/core/testing/render"
import { Sep38QuoteExpiryAuditorPanel } from "@/features/sep38-quote-expiry-auditor/components/Sep38QuoteExpiryAuditorPanel"
import { copy, errorCopy } from "@/features/sep38-quote-expiry-auditor/copy"
import { missingFeeQuote } from "@/features/sep38-quote-expiry-auditor/fixtures/boundary.fixture"
import { ANCHOR_ID, EVALUATION_TIME, quoteJson } from "@/features/sep38-quote-expiry-auditor/fixtures/normal.fixture"

async function fill(
  user: ReturnType<typeof renderFeature>["user"],
  quote: string
) {
  await user.click(screen.getByLabelText(copy.anchorLabel))
  await user.paste(ANCHOR_ID)
  await user.click(screen.getByLabelText(copy.evaluationLabel))
  await user.paste(EVALUATION_TIME)
  await user.click(screen.getByLabelText(copy.quoteLabel))
  await user.paste(quote)
  await user.click(screen.getByRole("button", { name: copy.submit }))
}

describe("Sep38QuoteExpiryAuditorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<Sep38QuoteExpiryAuditorPanel />)
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument()
  })

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<Sep38QuoteExpiryAuditorPanel />)
    await user.click(screen.getByRole("button", { name: copy.submit }))
    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.empty_input.title)
  })

  it("shows quote terms for a valid quote", async () => {
    const { user } = renderFeature(<Sep38QuoteExpiryAuditorPanel />)
    await fill(user, quoteJson())
    expect(await screen.findByText("quote-100")).toBeInTheDocument()
    expect(screen.getByText("100.0000000")).toBeInTheDocument()
  })

  it("shows the incomplete-terms warning when the fee is absent", async () => {
    const { user } = renderFeature(<Sep38QuoteExpiryAuditorPanel />)
    await fill(user, missingFeeQuote)
    expect(await screen.findByText(copy.incompleteTitle)).toBeInTheDocument()
  })
})
