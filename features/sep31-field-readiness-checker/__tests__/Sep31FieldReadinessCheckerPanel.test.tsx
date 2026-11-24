import { describe, expect, it } from "vitest"
import { renderFeature, screen } from "@/core/testing/render"
import { Sep31FieldReadinessCheckerPanel } from "@/features/sep31-field-readiness-checker/components/Sep31FieldReadinessCheckerPanel"
import { copy, errorCopy } from "@/features/sep31-field-readiness-checker/copy"
import { ANCHOR_ID, ASSET_CODE, EMAIL, fieldMapJson, requirementsJson } from "@/features/sep31-field-readiness-checker/fixtures/normal.fixture"

describe("Sep31FieldReadinessCheckerPanel", () => {
  it("renders the empty state first", () => {
    renderFeature(<Sep31FieldReadinessCheckerPanel />)
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument()
  })

  it("shows an error when submitted empty", async () => {
    const { user } = renderFeature(<Sep31FieldReadinessCheckerPanel />)
    await user.click(screen.getByRole("button", { name: copy.submit }))
    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.empty_input.title)
  })

  it("shows field names and hides the supplied email after a successful check", async () => {
    const { user } = renderFeature(<Sep31FieldReadinessCheckerPanel />)
    await user.click(screen.getByLabelText(copy.anchorLabel))
    await user.paste(ANCHOR_ID)
    await user.click(screen.getByLabelText(copy.assetLabel))
    await user.paste(ASSET_CODE)
    await user.click(screen.getByLabelText(copy.requirementsLabel))
    await user.paste(requirementsJson())
    await user.click(screen.getByLabelText(copy.fieldMapLabel))
    await user.paste(fieldMapJson())
    await user.click(screen.getByRole("button", { name: copy.submit }))
    expect(await screen.findByText("email_address")).toBeInTheDocument()
    expect(screen.queryByDisplayValue(EMAIL)).not.toBeInTheDocument()
    expect(screen.queryByText(EMAIL)).not.toBeInTheDocument()
  })
})
