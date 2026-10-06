import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { Sep12FieldsPanel } from "@/features/sep12-fields/components/Sep12FieldsPanel";
import { copy, errorCopy } from "@/features/sep12-fields/copy";
import { MAX_QUERY_LENGTH } from "@/features/sep12-fields/schema";

async function search(user: ReturnType<typeof renderFeature>["user"], value: string) {
  await user.click(screen.getByLabelText(copy.formLabel));
  if (value) await user.paste(value);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("Sep12FieldsPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<Sep12FieldsPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows the canonical name in full and the camelCase spelling beside it", async () => {
    const { user } = renderFeature(<Sep12FieldsPanel />);
    await search(user, "address_country_code");

    expect(await screen.findByText(copy.resultsTitle)).toBeInTheDocument();
    // The whole name, not a truncation: this is the string the user copies.
    expect(screen.getByText("address_country_code")).toBeInTheDocument();
    expect(screen.getByText("addressCountryCode")).toBeInTheDocument();
    expect(screen.getAllByText("Country code")).toHaveLength(2);
  });

  it("groups organization fields under their own heading", async () => {
    const { user } = renderFeature(<Sep12FieldsPanel />);
    await search(user, "organization.");

    expect(await screen.findByText("Organization")).toBeInTheDocument();
    expect(screen.queryByText("Financial account")).toBeNull();
  });

  it("says so plainly when nothing matches", async () => {
    const { user } = renderFeature(<Sep12FieldsPanel />);
    await search(user, "zzzz-definitely-not-a-field");

    expect(await screen.findByText(copy.noMatchesTitle)).toBeInTheDocument();
  });

  it("never claims to know which fields an anchor will require", async () => {
    const { user } = renderFeature(<Sep12FieldsPanel />);
    await search(user, "first_name");

    expect(await screen.findByText(copy.requirementNote)).toBeInTheDocument();
  });

  it("explains an oversized search instead of silently doing nothing", async () => {
    const { user } = renderFeature(<Sep12FieldsPanel />);
    await search(user, "x".repeat(MAX_QUERY_LENGTH + 1));

    expect(await screen.findByText(errorCopy.query_too_long.title)).toBeInTheDocument();
  });

  it("lists the whole set as field entries for an empty search", async () => {
    const { user, container } = renderFeature(<Sep12FieldsPanel />);
    await search(user, "");

    expect(await screen.findByText(copy.resultsTitle)).toBeInTheDocument();
    expect(container.querySelectorAll("li").length).toBeGreaterThan(20);
  });
});
