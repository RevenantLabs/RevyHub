import React from 'react';
import { copy } from "../copy";
import type { AccountDataEntriesResult as ResultType } from "../types";
import { AccountDataEntriesEmptyState } from "./AccountDataEntriesEmptyState";

interface Props {
  result: ResultType;
}

export function AccountDataEntriesResult({ result }: Props) {
  if (result.entries.length === 0) {
    return <AccountDataEntriesEmptyState />;
  }

  return (
    <div data-testid="account-data-entries-result">
      {result.entries.map((entry, idx) => (
        <div key={idx} data-testid="data-entry">
          <div data-testid="entry-key">{entry.key}</div>
          <div data-testid="entry-type">{entry.displayType === 'text' ? copy.result.typeText : copy.result.typeHex}</div>
          <div data-testid="entry-value">{entry.decodedValue}</div>
          <div data-testid="entry-bytes">{entry.byteLength}</div>
          <button 
            data-testid="copy-base64-btn"
            onClick={() => navigator.clipboard.writeText(entry.rawBase64)}
          >
            {copy.result.copyBase64Label}
          </button>
          <div data-testid="entry-raw">{entry.rawBase64}</div>
        </div>
      ))}
    </div>
  );
}
