import React from 'react';
import { AccountDataEntriesForm } from "./AccountDataEntriesForm";
import { AccountDataEntriesResult } from "./AccountDataEntriesResult";
import { useAccountDataEntries } from "../hooks/useAccountDataEntries";
import { copy } from "../copy";

export function AccountDataEntriesPanel() {
  const { loading, error, result, handleSubmit } = useAccountDataEntries();

  return (
    <div data-testid="account-data-entries-panel">
      <h1>{copy.title}</h1>
      <p>{copy.description}</p>
      
      <AccountDataEntriesForm onSubmit={handleSubmit} loading={loading} />
      
      {error && <div data-testid="account-data-entries-error">{error}</div>}
      
      {result && <AccountDataEntriesResult result={result} />}
    </div>
  );
}
