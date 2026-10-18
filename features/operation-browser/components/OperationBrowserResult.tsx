import { History } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { EmptyState } from "@/core/ui/EmptyState";
import { Field } from "@/core/ui/Field";
import { Select } from "@/core/ui/Input";
import { Button } from "@/core/ui/Button";
import { Badge } from "@/core/ui/Badge";
import { copy } from "@/features/operation-browser/copy";
import {
  filterOperations,
  flattenLoadedOperations,
  formatFilterSummary,
  formatOperationType,
  formatPagePosition,
  formatTimestamp,
  listFilterableOperationTypes
} from "@/features/operation-browser/lib/format";
import type { OperationBrowserResult } from "@/features/operation-browser/types";

export function OperationBrowserResult({
  result,
  paging,
  onLoadOlder,
  onLoadNewer,
  onTypeFilterChange
}: {
  result: OperationBrowserResult;
  paging: "idle" | "older" | "newer";
  onLoadOlder: () => void;
  onLoadNewer: () => void;
  onTypeFilterChange: (typeFilter: string) => void;
}) {
  const loadedOperations = flattenLoadedOperations(result.pages);
  const currentPage = result.pages[result.pageIndex] ?? [];
  const filteredCurrentPage = filterOperations(currentPage, result.typeFilter);
  const filteredLoadedCount = filterOperations(loadedOperations, result.typeFilter).length;
  const canLoadNewer = result.pageIndex > 0;
  const canLoadOlder =
    result.pageIndex < result.pages.length - 1 || (result.pageIndex === result.pages.length - 1 && result.hasMoreOlder);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>

        <div className="space-y-4">
          <DataList
            items={[
              {
                label: copy.formLabel,
                value: <CopyableValue label="account" value={result.accountId} />
              },
              {
                label: "Summary",
                value: formatFilterSummary(filteredLoadedCount, loadedOperations.length, result.typeFilter)
              },
              {
                label: "View",
                value: formatPagePosition(result.pageIndex, result.pages.length),
                mono: true
              }
            ]}
          />

          <Field label={copy.filterLabel}>
            {({ inputId, describedBy }) => (
              <Select
                id={inputId}
                aria-describedby={describedBy}
                value={result.typeFilter}
                onChange={(event) => onTypeFilterChange(event.target.value)}
              >
                <option value="all">{copy.filterAll}</option>
                {listFilterableOperationTypes().map((type) => (
                  <option key={type} value={type}>
                    {formatOperationType(type)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </Card>

      {filteredCurrentPage.length ? (
        <ol className="space-y-3">
          {filteredCurrentPage.map((operation) => (
            <li key={operation.id}>
              <Card
                className={
                  operation.transactionSuccessful
                    ? undefined
                    : "border-[#f5c2be] bg-[#fff7f6]"
                }
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-[#172033]">
                      {formatOperationType(operation.type)}
                    </span>
                    <Badge tone={operation.transactionSuccessful ? "success" : "danger"}>
                      {operation.transactionSuccessful
                        ? copy.successfulOperation
                        : copy.failedOperation}
                    </Badge>
                  </div>

                  <DataList
                    items={[
                      { label: "Created", value: formatTimestamp(operation.createdAt) },
                      {
                        label: "Transaction",
                        value: (
                          <CopyableValue
                            label="transaction hash"
                            value={operation.transactionHash}
                            visible={8}
                          />
                        )
                      },
                      {
                        label: "Source account",
                        value: (
                          <CopyableValue label="operation source" value={operation.sourceAccount} visible={4} />
                        )
                      }
                    ]}
                  />

                  {operation.params.length ? (
                    <div>
                      <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#4e5c73]">
                        {copy.paramsTitle}
                      </h3>
                      <DataList
                        items={operation.params.map((param) => ({
                          label: param.label,
                          value: param.value,
                          mono: param.label.toLowerCase().includes("id") || param.label.includes("account")
                        }))}
                      />
                    </div>
                  ) : null}
                </div>
              </Card>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState
          icon={History}
          title={copy.noOperationsTitle}
          description={copy.noOperationsDescription}
        />
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" disabled={!canLoadNewer || paging !== "idle"} onClick={onLoadNewer}>
          {copy.loadNewer}
        </Button>
        <Button type="button" disabled={!canLoadOlder || paging === "older"} onClick={onLoadOlder}>
          {paging === "older" ? copy.loadingPage : copy.loadOlder}
        </Button>
      </div>
    </div>
  );
}
