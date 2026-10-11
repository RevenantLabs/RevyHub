import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { HorizonPaginationInspectorPanel } from "@/features/horizon-pagination-inspector/components/HorizonPaginationInspectorPanel";
import { copy, errorCopy } from "@/features/horizon-pagination-inspector/copy";
import {
  duplicateIdsCollectionJson,
  emptyRecordsCollectionJson,
  hostileLinksCollectionJson,
  malformedJson,
  offOriginCollectionJson,
  secretSeed,
  validCollectionJson
} from "@/features/horizon-pagination-inspector/fixtures/horizonPaginationInspector.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function inspect(user: User, collection: string, origin?: string) {
  await user.click(screen.getByLabelText(copy.collectionLabel));
  await user.paste(collection);

  if (origin !== undefined) {
    await user.click(screen.getByLabelText(copy.expectedOriginLabel));
    await user.paste(origin);
  }

  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("HorizonPaginationInspectorPanel", () => {
  it("shows empty state initially", () => {
    renderFeature(<HorizonPaginationInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("inspects a valid collection and displays overview and records", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, validCollectionJson);

    expect(await screen.findByText(copy.overviewTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.noAnomaliesTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.recordsTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.linksTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.exportTitle)).toBeInTheDocument();
  });

  it("handles an empty records collection without error", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, emptyRecordsCollectionJson);

    expect(await screen.findByText(copy.overviewTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.noRecords)).toBeInTheDocument();
  });

  it("displays warnings when duplicates are detected", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, duplicateIdsCollectionJson);

    expect(await screen.findByText(copy.anomaliesDetectedTitle)).toBeInTheDocument();
  });

  it("flags off-origin links when expectedOrigin is specified", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, offOriginCollectionJson, "https://horizon.stellar.org");

    expect(await screen.findByText(copy.offOriginTitle)).toBeInTheDocument();
  });

  it("renders hostile links as inert text without copy controls", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, hostileLinksCollectionJson);

    expect(await screen.findByText(copy.overviewTitle)).toBeInTheDocument();
    expect(screen.getAllByText(copy.badgeHostile).length).toBeGreaterThan(0);
    expect(screen.getAllByText(copy.inertUrlNote).length).toBeGreaterThan(0);
  });

  it("displays error message on malformed JSON", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, malformedJson);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(errorCopy.invalid_json.title)).toBeInTheDocument();
  });

  it("never renders a pasted secret key in the DOM", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, `{"key":"${secretSeed}"}`);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText(secretSeed)).not.toBeInTheDocument();
  });

  it("clears results on reset", async () => {
    const { user } = renderFeature(<HorizonPaginationInspectorPanel />);
    await inspect(user, validCollectionJson);

    expect(await screen.findByText(copy.overviewTitle)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: copy.resetAll }));
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });
});
