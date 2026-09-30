import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { HorizonPaginationInspectorPanel } from "@/features/horizon-pagination-inspector/components/HorizonPaginationInspectorPanel";
import { copy, errorCopy } from "@/features/horizon-pagination-inspector/copy";
import {
  completePageJson,
  duplicateTokensJson,
  finalPageJson,
  missingIdentifierJson,
  nextLinkWithoutCursorJson,
  noLinksObjectJson,
  notJson,
  shortPageWithNextJson
} from "@/features/horizon-pagination-inspector/fixtures/horizonPaginationInspector.fixture";

async function inspect(user: ReturnType<typeof renderFeature>["user"], value: string) {
  await user.click(screen.getByLabelText(copy.formLabel));
  await user.paste(value);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("HorizonPaginationInspectorPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<HorizonPaginationInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("reports the record count and order for a complete page", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, completePageJson);

    expect(await screen.findByText(copy.summaryTitle)).toBeInTheDocument();
    expect(screen.getByText("3 records")).toBeInTheDocument();
    expect(screen.getByText("Increasing in page order")).toBeInTheDocument();
  });

  it("warns that a short page still is not the end", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, shortPageWithNextJson);

    expect(await screen.findByText("1 record")).toBeInTheDocument();
    expect(screen.getByText("Present — more pages may follow")).toBeInTheDocument();
  });

  it("does not claim an ending when a next link is simply absent", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, finalPageJson);

    expect(await screen.findByText("Absent from this response")).toBeInTheDocument();
  });

  it("distinguishes a response with no links object from a final page", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, noLinksObjectJson);

    expect(await screen.findByText(copy.linksObjectAbsentTitle)).toBeInTheDocument();
  });

  it("names duplicate identifiers with their positions", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, duplicateTokensJson);

    expect(await screen.findByText(copy.labelDuplicates)).toBeInTheDocument();
    expect(screen.getByText(/#1, #2/)).toBeInTheDocument();
  });

  it("lists records that cannot be de-duplicated", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, missingIdentifierJson);

    expect(await screen.findByText(copy.labelMissing)).toBeInTheDocument();
    // The second record carries neither identifier, so it is reported in both
    // the missing-identifier list and the non-numeric-token list. That double
    // report is intended: such a record can neither be de-duplicated nor used
    // as a cursor, which are two distinct problems for a consumer.
    expect(screen.getAllByText("#2")).toHaveLength(2);
  });

  it("copes with a next link that carries no cursor value", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, nextLinkWithoutCursorJson);

    expect(await screen.findByText(copy.linksTitle)).toBeInTheDocument();
    expect(screen.getAllByText(copy.linkAbsent).length).toBeGreaterThan(0);
  });

  it("explains a bad paste differently from a wrong-shaped document", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, notJson);

    expect(await screen.findByText(errorCopy.not_json.title)).toBeInTheDocument();
  });

  it("never offers to sign or submit anything", () => {
    renderFeature(<HorizonPaginationInspectorPanel />);

    expect(screen.queryByText(/sign/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/submit transaction/i)).not.toBeInTheDocument();
  });
});
