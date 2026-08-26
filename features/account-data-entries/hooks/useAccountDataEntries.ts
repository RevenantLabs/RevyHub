import { useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { parseAccountDataEntriesInput } from "../schema";
import { fetchAccountDataEntries } from "../lib/accountDataEntries";
import { ACCOUNT_DATA_ENTRIES_ERROR_MESSAGES } from "../lib/accountDataEntries.errors";
import type { AccountDataEntriesResult } from "../types";

export function useAccountDataEntries() {
  const { network } = useNetwork();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AccountDataEntriesResult | null>(null);

  const handleSubmit = async (inputValue: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const parsed = parseAccountDataEntriesInput(inputValue);
    if (!parsed.ok) {
      setError(ACCOUNT_DATA_ENTRIES_ERROR_MESSAGES[parsed.code]);
      setLoading(false);
      return;
    }

    const fetchRes = await fetchAccountDataEntries(parsed.value.accountId, network.url);
    if (!fetchRes.ok) {
      setError(ACCOUNT_DATA_ENTRIES_ERROR_MESSAGES[fetchRes.code]);
    } else {
      setResult(fetchRes.value);
    }
    setLoading(false);
  };

  return { loading, error, result, handleSubmit };
}
