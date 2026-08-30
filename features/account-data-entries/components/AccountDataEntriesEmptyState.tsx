import React from 'react';
import { copy } from "../copy";

export function AccountDataEntriesEmptyState() {
  return <div data-testid="account-data-entries-empty-state">{copy.result.emptyState}</div>;
}
