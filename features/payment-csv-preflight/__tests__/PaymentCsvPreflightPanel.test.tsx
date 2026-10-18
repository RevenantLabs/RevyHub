import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { PaymentCsvPreflightPanel } from "@/features/payment-csv-preflight/components/PaymentCsvPreflightPanel";
import { copy, errorCopy, rowIssueCopy } from "@/features/payment-csv-preflight/copy";
import {
  duplicateRowsCsv,
  firstDestination,
  invalidRowsCsv,
  issuerA,
  sameCodeDifferentIssuerCsv,
  secretKeyRowCsv,
  secretSeed,
  unterminatedQuoteCsv,
  validCsv
} from "@/features/payment-csv-preflight/fixtures/paymentCsvPreflight.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function run(user: User, csv: string) {
  // `paste` rather than `type`: a CSV fixture is thousands of keystrokes.
  await user.click(screen.getByLabelText(copy.formLabel));
  await user.paste(csv);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  await screen.findByText(copy.summaryTitle);
}

describe("PaymentCsvPreflightPanel", () => {
  it("shows the empty state before anything is checked", () => {
    renderFeature(<PaymentCsvPreflightPanel />);

    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    expect(screen.queryByText(copy.rowsTitle)).not.toBeInTheDocument();
  });

  it("reports exact totals per asset for a valid file", async () => {
    const { user } = renderFeature(<PaymentCsvPreflightPanel />);

    await run(user, validCsv);

    expect(screen.getByText(copy.overview(3, 0, 0))).toBeInTheDocument();
    expect(screen.getByText("11.5")).toBeInTheDocument();
    // Once as the row amount, once as the asset total — both exact.
    expect(screen.getAllByText("250.0000001")).toHaveLength(2);
  });

  it("warns when one asset code appears under two issuers", async () => {
    const { user } = renderFeature(<PaymentCsvPreflightPanel />);

    await run(user, sameCodeDifferentIssuerCsv);

    expect(screen.getByText(copy.sameCodeWarningTitle)).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(issuerA.slice(0, 4)))).not.toHaveLength(0);
  });

  it("keeps duplicate rows visible instead of dropping one", async () => {
    const { user } = renderFeature(<PaymentCsvPreflightPanel />);

    await run(user, duplicateRowsCsv);

    expect(screen.getByText(copy.overview(3, 0, 2))).toBeInTheDocument();
    expect(screen.getAllByText(copy.statusDuplicate)).toHaveLength(2);
    expect(screen.getByText(copy.duplicateLines([4]))).toBeInTheDocument();
  });

  it("filters down to the invalid rows and back", async () => {
    const { user } = renderFeature(<PaymentCsvPreflightPanel />);

    await run(user, duplicateRowsCsv);
    // All three rows are valid; two of them are also duplicates.
    expect(screen.getAllByText(copy.rowValid)).toHaveLength(3);

    await user.selectOptions(screen.getByLabelText(copy.filterLabel), "invalid");
    expect(screen.getByText(copy.filterEmpty)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(copy.filterLabel), "all");
    expect(screen.queryByText(copy.filterEmpty)).not.toBeInTheDocument();
  });

  it("gives row-specific advice and blocks export while a row is invalid", async () => {
    const { user } = renderFeature(<PaymentCsvPreflightPanel />);

    await run(user, invalidRowsCsv);

    expect(screen.getByText(rowIssueCopy.too_many_decimals)).toBeInTheDocument();
    expect(screen.getByText(errorCopy.invalid_rows.title)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: copy.exportAction })).not.toBeInTheDocument();
  });

  it("offers the export once every row is valid", async () => {
    const { user } = renderFeature(<PaymentCsvPreflightPanel />);

    await run(user, validCsv);

    expect(screen.getByRole("button", { name: copy.exportAction })).toBeInTheDocument();

    const exported = screen.getByLabelText(copy.exportLabel) as HTMLTextAreaElement;
    expect(exported.value).toContain(firstDestination);
    expect(exported.value).toContain('"total": "11.5000000"');
  });

  it("announces a malformed file with its line reference", async () => {
    const { user } = renderFeature(<PaymentCsvPreflightPanel />);

    await user.click(screen.getByLabelText(copy.formLabel));
    await user.paste(unterminatedQuoteCsv);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(errorCopy.invalid_csv.title);
    expect(alert).toHaveTextContent("line 2");
  });

  it("announces empty input as an error", async () => {
    const { user } = renderFeature(<PaymentCsvPreflightPanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.empty_input.title);
  });

  it("never renders a secret key that was in the file", async () => {
    const { user } = renderFeature(<PaymentCsvPreflightPanel />);

    await run(user, secretKeyRowCsv);

    expect(screen.getByText(copy.secretRow)).toBeInTheDocument();
    expect(screen.getByText(rowIssueCopy.secret_key_destination)).toBeInTheDocument();

    // The report is derived output: the seed must not survive into any of it.
    for (const table of screen.getAllByRole("table")) {
      expect(table.textContent ?? "").not.toContain(secretSeed);
    }

    // The field the user pasted into is the browser's own copy of their input,
    // and clearing the form takes the seed out of the document entirely.
    await user.click(screen.getByRole("button", { name: copy.reset }));
    expect(document.body.textContent ?? "").not.toContain(secretSeed);
  });

  it("reads a chosen file locally and names it", async () => {
    const { user } = renderFeature(<PaymentCsvPreflightPanel />);

    await user.upload(
      screen.getByLabelText(copy.fileLabel),
      new File([validCsv], "january.csv", { type: "text/csv" })
    );

    await waitFor(() => expect(screen.getByText(copy.summaryTitle)).toBeInTheDocument());
    expect(screen.getByText(copy.sourceFile("january.csv"))).toBeInTheDocument();
  });

  it("returns to the empty state when cleared", async () => {
    const { user } = renderFeature(<PaymentCsvPreflightPanel />);

    await run(user, validCsv);
    await user.click(screen.getByRole("button", { name: copy.reset }));

    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.formLabel)).toHaveValue("");
  });
});
