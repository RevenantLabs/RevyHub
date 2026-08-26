import os

files = {
"features/account-data-entries/types.ts": """
export interface AccountDataEntriesInput {
  accountId: string;
}

export type AccountDataEntryDisplayType = 'text' | 'hex';

export interface AccountDataEntry {
  key: string;
  rawBase64: string;
  displayType: AccountDataEntryDisplayType;
  decodedValue: string;
  byteLength: number;
}

export interface AccountDataEntriesResult {
  entries: AccountDataEntry[];
}

export type AccountDataEntriesErrorCode = 
  | "empty_input" 
  | "invalid_account_id" 
  | "account_not_found" 
  | "request_failed";
""",
"features/account-data-entries/schema.ts": """
import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { AccountDataEntriesErrorCode, AccountDataEntriesInput } from "./types";
import { StrKey } from "@stellar/stellar-sdk";

export function parseAccountDataEntriesInput(raw: string): Result<AccountDataEntriesInput, AccountDataEntriesErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  if (!StrKey.isValidEd25519PublicKey(value)) {
    return err("invalid_account_id");
  }
  return ok({ accountId: value });
}
""",
"features/account-data-entries/lib/accountDataEntries.errors.ts": """
import type { AccountDataEntriesErrorCode } from "../types";

export const ACCOUNT_DATA_ENTRIES_ERROR_MESSAGES: Record<AccountDataEntriesErrorCode, string> = {
  empty_input: "Account ID is required.",
  invalid_account_id: "Invalid Ed25519 public key format.",
  account_not_found: "Account not found on the network.",
  request_failed: "Failed to fetch account data entries."
};
""",
"features/account-data-entries/copy.ts": """
export const copy = {
  title: "Account Data Entry Viewer",
  description: "View key-value data associated with a Stellar account.",
  form: {
    accountIdLabel: "Account ID",
    accountIdPlaceholder: "G...",
    submitLabel: "View Data Entries"
  },
  result: {
    emptyState: "This account has no data entries.",
    copyBase64Label: "Copy Raw Base64",
    typeText: "Text",
    typeHex: "Hex (Non-printable)"
  }
};
""",
"features/account-data-entries/lib/format.ts": """
import { Buffer } from "buffer";
import type { AccountDataEntryDisplayType } from "../types";

export function decodeDataEntry(base64: string): { 
  displayType: AccountDataEntryDisplayType; 
  decodedValue: string; 
  byteLength: number; 
} {
  try {
    const buf = Buffer.from(base64, 'base64');
    const str = buf.toString('utf8');
    
    // Check if valid round-trip
    if (Buffer.from(str, 'utf8').equals(buf)) {
      // Check for control characters (except standard whitespace)
      // Matches standard ASCII control chars (0-31, 127) excluding \n (10), \r (13), \t (9)
      const hasControlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(str);
      
      if (!hasControlChars) {
        return {
          displayType: 'text',
          decodedValue: str,
          byteLength: buf.length
        };
      }
    }
    
    // Hex fallback
    return {
      displayType: 'hex',
      decodedValue: buf.toString('hex'),
      byteLength: buf.length
    };
  } catch (e) {
    return {
      displayType: 'hex',
      decodedValue: "",
      byteLength: 0
    };
  }
}
""",
"features/account-data-entries/lib/accountDataEntries.ts": """
import { err, ok, type Result } from "@/core/result/result";
import type { AccountDataEntriesErrorCode, AccountDataEntriesResult, AccountDataEntry } from "../types";
import { decodeDataEntry } from "./format";

export async function fetchAccountDataEntries(
  accountId: string, 
  networkUrl: string
): Promise<Result<AccountDataEntriesResult, AccountDataEntriesErrorCode>> {
  try {
    const res = await fetch(`${networkUrl}/accounts/${accountId}`);
    if (res.status === 404) {
      return err("account_not_found");
    }
    if (!res.ok) {
      return err("request_failed");
    }
    
    const data = await res.json();
    const dataMapping: Record<string, string> = data.data || {};
    
    const entries: AccountDataEntry[] = Object.entries(dataMapping).map(([key, rawBase64]) => {
      const decoded = decodeDataEntry(rawBase64);
      return {
        key,
        rawBase64,
        ...decoded
      };
    });
    
    return ok({ entries });
  } catch (e) {
    return err("request_failed");
  }
}
""",
"features/account-data-entries/hooks/useAccountDataEntries.ts": """
import { useState } from "react";
import { useNetwork } from "@/core/settings/hooks/useNetwork";
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
      setError(ACCOUNT_DATA_ENTRIES_ERROR_MESSAGES[parsed.error]);
      setLoading(false);
      return;
    }

    const fetchRes = await fetchAccountDataEntries(parsed.value.accountId, network.url);
    if (!fetchRes.ok) {
      setError(ACCOUNT_DATA_ENTRIES_ERROR_MESSAGES[fetchRes.error]);
    } else {
      setResult(fetchRes.value);
    }
    setLoading(false);
  };

  return { loading, error, result, handleSubmit };
}
""",
"features/account-data-entries/components/AccountDataEntriesEmptyState.tsx": """
import React from 'react';
import { copy } from "../copy";

export function AccountDataEntriesEmptyState() {
  return <div data-testid="account-data-entries-empty-state">{copy.result.emptyState}</div>;
}
""",
"features/account-data-entries/components/AccountDataEntriesForm.tsx": """
import React, { useState } from 'react';
import { Field } from "@/core/ui/field";
import { copy } from "../copy";

interface Props {
  onSubmit: (val: string) => void;
  loading: boolean;
}

export function AccountDataEntriesForm({ onSubmit, loading }: Props) {
  const [val, setVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(val);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="account-data-entries-form">
      <Field
        label={copy.form.accountIdLabel}
        id="account-id"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={copy.form.accountIdPlaceholder}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>{copy.form.submitLabel}</button>
    </form>
  );
}
""",
"features/account-data-entries/components/AccountDataEntriesResult.tsx": """
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
""",
"features/account-data-entries/components/AccountDataEntriesPanel.tsx": """
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
""",
"features/account-data-entries/panel.tsx": """
import { AccountDataEntriesPanel } from "./components/AccountDataEntriesPanel";
export default AccountDataEntriesPanel;
""",
"features/account-data-entries/manifest.ts": """
import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "account-data-entries",
  title: "Account Data Entry Viewer",
  description: "View key-value data entries on a Stellar account.",
  character: "Here is your account data.",
  category: "accounts",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["account-data-entries"]
};
""",
"features/account-data-entries/README.md": """
# Account Data Entries

Views the data entries of a given account.
""",
"features/account-data-entries/__tests__/schema.test.ts": """
import { describe, expect, it } from "vitest";
import { parseAccountDataEntriesInput } from "../schema";
import { StrKey, Keypair } from "@stellar/stellar-sdk";

describe("parseAccountDataEntriesInput", () => {
  it("returns ok for valid account ID", () => {
    const pub = Keypair.random().publicKey();
    const res = parseAccountDataEntriesInput(pub);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.accountId).toBe(pub);
    }
  });

  it("returns err for empty input", () => {
    const res = parseAccountDataEntriesInput("   ");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("empty_input");
    }
  });

  it("returns err for invalid account ID", () => {
    const res = parseAccountDataEntriesInput("INVALID");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("invalid_account_id");
    }
  });
});
""",
"features/account-data-entries/__tests__/format.test.ts": """
import { describe, expect, it } from "vitest";
import { decodeDataEntry } from "../lib/format";
import { Buffer } from "buffer";

describe("decodeDataEntry", () => {
  it("decodes printable ascii text correctly", () => {
    const base64 = Buffer.from("hello world", "utf8").toString("base64");
    const decoded = decodeDataEntry(base64);
    expect(decoded.displayType).toBe("text");
    expect(decoded.decodedValue).toBe("hello world");
    expect(decoded.byteLength).toBe(11);
  });

  it("falls back to hex for non-printable control chars", () => {
    const base64 = Buffer.from("hello\\x00world", "utf8").toString("base64");
    const decoded = decodeDataEntry(base64);
    expect(decoded.displayType).toBe("hex");
    expect(decoded.decodedValue).toBe(Buffer.from("hello\\x00world", "utf8").toString("hex"));
  });

  it("allows standard whitespace", () => {
    const base64 = Buffer.from("hello\\n\\t\\rworld", "utf8").toString("base64");
    const decoded = decodeDataEntry(base64);
    expect(decoded.displayType).toBe("text");
    expect(decoded.decodedValue).toBe("hello\\n\\t\\rworld");
  });

  it("handles invalid base64 smoothly", () => {
    // Actually Buffer.from handles bad base64, but let's test a case
    const decoded = decodeDataEntry("!@#$");
    expect(decoded.displayType).toBe("hex");
  });
});
""",
"features/account-data-entries/__tests__/accountDataEntries.test.ts": """
import { describe, expect, it } from "vitest";
import { fetchAccountDataEntries } from "../lib/accountDataEntries";
import { server } from "@/core/test/setup";
import { http, HttpResponse } from "msw";

describe("fetchAccountDataEntries", () => {
  const url = "http://test";

  it("returns account_not_found for 404", async () => {
    server.use(http.get(`${url}/accounts/G123`, () => new HttpResponse(null, { status: 404 })));
    const res = await fetchAccountDataEntries("G123", url);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("account_not_found");
  });

  it("returns request_failed for 500", async () => {
    server.use(http.get(`${url}/accounts/G123`, () => new HttpResponse(null, { status: 500 })));
    const res = await fetchAccountDataEntries("G123", url);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("request_failed");
  });

  it("returns entries on success", async () => {
    const b64 = Buffer.from("hello").toString("base64");
    server.use(http.get(`${url}/accounts/G123`, () => HttpResponse.json({
      data: { "key1": b64 }
    })));
    const res = await fetchAccountDataEntries("G123", url);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.entries).toHaveLength(1);
      expect(res.value.entries[0].key).toBe("key1");
      expect(res.value.entries[0].decodedValue).toBe("hello");
    }
  });

  it("handles account with no data entries", async () => {
    server.use(http.get(`${url}/accounts/G123`, () => HttpResponse.json({ data: {} })));
    const res = await fetchAccountDataEntries("G123", url);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.entries).toHaveLength(0);
  });
});
""",
"features/account-data-entries/__tests__/useAccountDataEntries.test.tsx": """
import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAccountDataEntries } from "../hooks/useAccountDataEntries";
import { Keypair } from "@stellar/stellar-sdk";
import { server } from "@/core/test/setup";
import { http, HttpResponse } from "msw";

vi.mock("@/core/settings/hooks/useNetwork", () => ({
  useNetwork: () => ({ network: { url: "http://test" } })
}));

describe("useAccountDataEntries", () => {
  it("handles validation error", async () => {
    const { result } = renderHook(() => useAccountDataEntries());
    await act(async () => {
      await result.current.handleSubmit("bad");
    });
    expect(result.current.error).toBe("Invalid Ed25519 public key format.");
    expect(result.current.result).toBeNull();
  });

  it("handles network error", async () => {
    const pub = Keypair.random().publicKey();
    server.use(http.get(`http://test/accounts/${pub}`, () => new HttpResponse(null, { status: 404 })));
    const { result } = renderHook(() => useAccountDataEntries());
    await act(async () => {
      await result.current.handleSubmit(pub);
    });
    expect(result.current.error).toBe("Account not found on the network.");
  });

  it("handles success", async () => {
    const pub = Keypair.random().publicKey();
    server.use(http.get(`http://test/accounts/${pub}`, () => HttpResponse.json({ data: {} })));
    const { result } = renderHook(() => useAccountDataEntries());
    await act(async () => {
      await result.current.handleSubmit(pub);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.result?.entries).toHaveLength(0);
  });
});
""",
"features/account-data-entries/__tests__/AccountDataEntriesPanel.test.tsx": """
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AccountDataEntriesPanel } from "../components/AccountDataEntriesPanel";
import { Keypair } from "@stellar/stellar-sdk";
import { server } from "@/core/test/setup";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";

vi.mock("@/core/settings/hooks/useNetwork", () => ({
  useNetwork: () => ({ network: { url: "http://test" } })
}));

describe("AccountDataEntriesPanel", () => {
  it("renders form", () => {
    render(<AccountDataEntriesPanel />);
    expect(screen.getByTestId("account-data-entries-form")).toBeInTheDocument();
  });

  it("shows empty state when no entries", async () => {
    const pub = Keypair.random().publicKey();
    server.use(http.get(`http://test/accounts/${pub}`, () => HttpResponse.json({ data: {} })));
    render(<AccountDataEntriesPanel />);
    
    fireEvent.change(screen.getByLabelText(/Account ID/i), { target: { value: pub } });
    fireEvent.click(screen.getByRole("button", { name: /View Data Entries/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId("account-data-entries-empty-state")).toBeInTheDocument();
    });
  });

  it("shows results when entries exist", async () => {
    const pub = Keypair.random().publicKey();
    const b64 = Buffer.from("hello").toString("base64");
    server.use(http.get(`http://test/accounts/${pub}`, () => HttpResponse.json({ data: { "mykey": b64 } })));
    render(<AccountDataEntriesPanel />);
    
    fireEvent.change(screen.getByLabelText(/Account ID/i), { target: { value: pub } });
    fireEvent.click(screen.getByRole("button", { name: /View Data Entries/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId("account-data-entries-result")).toBeInTheDocument();
      expect(screen.getByText("mykey")).toBeInTheDocument();
      expect(screen.getByText("hello")).toBeInTheDocument();
    });
  });
});
""",
"features/account-data-entries/__tests__/a11y.test.tsx": """
import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { AccountDataEntriesPanel } from "../components/AccountDataEntriesPanel";
import { AccountDataEntriesResult } from "../components/AccountDataEntriesResult";
import { vi } from "vitest";

vi.mock("@/core/settings/hooks/useNetwork", () => ({
  useNetwork: () => ({ network: { url: "http://test" } })
}));

describe("AccountDataEntries A11y", () => {
  it("has no a11y violations in initial state", async () => {
    const { container } = render(<AccountDataEntriesPanel />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations in result state", async () => {
    const { container } = render(<AccountDataEntriesResult result={{ entries: [{
      key: "test", rawBase64: "dGVzdA==", displayType: "text", decodedValue: "test", byteLength: 4
    }] }} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
""",
"features/account-data-entries/msw/handlers.ts": """
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/accounts/*", () => {
    return HttpResponse.json({
      data: {
        "hello": Buffer.from("world").toString("base64")
      }
    });
  })
];
""",
"features/account-data-entries/fixtures/accountDataEntries.fixture.ts": """
import { Keypair } from "@stellar/stellar-sdk";

export const mockAccount = Keypair.random().publicKey();
""",
"features/account-data-entries/e2e/account-data-entries.spec.ts": """
import { test, expect } from "@playwright/test";

test("account data entries end-to-end", async ({ page }) => {
  await page.goto("/account-data-entries");
  // Assuming basic e2e setup
});
"""
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content.strip() + "\n")
