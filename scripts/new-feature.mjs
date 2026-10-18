#!/usr/bin/env node
/**
 * Scaffolds a complete feature slice that already satisfies the feature
 * contract (see docs/FEATURE_CONTRACT.md and scripts/verify-features.mjs).
 *
 *   npm run new:feature -- ledger-lookup "Ledger Lookup" transactions
 *
 * The generated slice compiles, renders and passes its own tests immediately;
 * the work is replacing the placeholder logic with the real tool.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const [slug, titleArg, categoryArg = "developer"] = process.argv.slice(2);

if (!slug || !/^[a-z][a-z0-9-]*$/.test(slug)) {
  console.error('Usage: npm run new:feature -- <kebab-slug> "<Title>" [category]');
  process.exit(1);
}

const pascal = slug
  .split("-")
  .map((part) => part[0].toUpperCase() + part.slice(1))
  .join("");
const camel = pascal[0].toLowerCase() + pascal.slice(1);
const title = titleArg || slug.replace(/-/g, " ");

const dir = path.join(root, "features", slug);
if (existsSync(dir)) {
  console.error(`features/${slug} already exists`);
  process.exit(1);
}

const files = {
  "manifest.ts": `import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "${slug}",
  title: "${title}",
  description: "TODO: one sentence describing what this tool does.",
  character: "TODO: one in-world character line.",
  category: "${categoryArg}",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["${slug}"]
};
`,

  "panel.tsx": `export { ${pascal}Panel as default } from "@/features/${slug}/components/${pascal}Panel";
`,

  "types.ts": `export interface ${pascal}Input {
  value: string;
}

export interface ${pascal}Result {
  summary: string;
}

export type ${pascal}ErrorCode = "empty_input" | "invalid_input" | "not_found" | "request_failed";
`,

  "schema.ts": `import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { ${pascal}ErrorCode, ${pascal}Input } from "@/features/${slug}/types";

/** Parses raw form input into a validated request, without throwing. */
export function parse${pascal}Input(raw: string): Result<${pascal}Input, ${pascal}ErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  return ok({ value });
}
`,

  "copy.ts": `import type { ${pascal}ErrorCode } from "@/features/${slug}/types";

export const copy = {
  formLabel: "Value",
  formHint: "TODO: explain what to paste here.",
  submit: "Run",
  emptyTitle: "Nothing checked yet",
  emptyDescription: "TODO: describe what the user will see after running the tool.",
  resultTitle: "Result"
} as const;

export const errorCopy: Record<${pascal}ErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter a value first",
    description: "TODO"
  },
  invalid_input: {
    title: "That value is not valid",
    description: "TODO"
  },
  not_found: {
    title: "Not found",
    description: "TODO"
  },
  request_failed: {
    title: "The request did not complete",
    description: "TODO"
  }
};
`,

  [`lib/${camel}.ts`]: `import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { ${pascal}ErrorCode, ${pascal}Input, ${pascal}Result } from "@/features/${slug}/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function run${pascal}(
  input: ${pascal}Input,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<${pascal}Result, ${pascal}ErrorCode>> {
  return ok({ summary: input.value });
}
`,

  [`lib/${camel}.errors.ts`]: `import { classifyHorizonError } from "@/core/horizon/errors";
import type { ${pascal}ErrorCode } from "@/features/${slug}/types";

/** Maps transport failures onto this tool's own error codes. */
export function to${pascal}ErrorCode(error: unknown): ${pascal}ErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "not_found" : "request_failed";
}
`,

  "lib/format.ts": `/** Presentation-only helpers. Keep formatting out of components and logic. */
export function formatSummary(value: string): string {
  return value.trim();
}
`,

  [`hooks/use${pascal}.ts`]: `"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parse${pascal}Input } from "@/features/${slug}/schema";
import { run${pascal} } from "@/features/${slug}/lib/${camel}";
import { to${pascal}ErrorCode } from "@/features/${slug}/lib/${camel}.errors";
import type { ${pascal}ErrorCode, ${pascal}Result } from "@/features/${slug}/types";

export type ${pascal}State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ${pascal}Result }
  | { status: "error"; code: ${pascal}ErrorCode };

export function use${pascal}() {
  const { network } = useNetwork();
  const [state, setState] = useState<${pascal}State>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parse${pascal}Input(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<${pascal}Result, ${pascal}ErrorCode> = await run${pascal}(
          parsed.value,
          network,
          next.signal
        );
        if (next.signal.aborted) return;
        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: to${pascal}ErrorCode(error) });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
`,

  [`components/${pascal}Panel.tsx`]: `"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { use${pascal} } from "@/features/${slug}/hooks/use${pascal}";
import { errorCopy } from "@/features/${slug}/copy";
import { ${pascal}Form } from "@/features/${slug}/components/${pascal}Form";
import { ${pascal}Result } from "@/features/${slug}/components/${pascal}Result";
import { ${pascal}EmptyState } from "@/features/${slug}/components/${pascal}EmptyState";

export function ${pascal}Panel() {
  const { state, submit } = use${pascal}();

  return (
    <div className="space-y-5">
      <Card>
        <${pascal}Form onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <${pascal}Result result={state.result} /> : null}

      {state.status === "idle" ? <${pascal}EmptyState /> : null}
    </div>
  );
}
`,

  [`components/${pascal}Form.tsx`]: `"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/${slug}/copy";

export function ${pascal}Form({
  onSubmit,
  pending
}: {
  onSubmit: (value: string) => void;
  pending: boolean;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={copy.formLabel} hint={copy.formHint}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Working..." : copy.submit}
      </Button>
    </form>
  );
}
`,

  [`components/${pascal}Result.tsx`]: `import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/${slug}/copy";
import { formatSummary } from "@/features/${slug}/lib/format";
import type { ${pascal}Result as ${pascal}ResultValue } from "@/features/${slug}/types";

export function ${pascal}Result({ result }: { result: ${pascal}ResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[{ label: "Summary", value: formatSummary(result.summary) }]} />
    </Card>
  );
}
`,

  [`components/${pascal}EmptyState.tsx`]: `import { Sparkles } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/${slug}/copy";

export function ${pascal}EmptyState() {
  return (
    <EmptyState icon={Sparkles} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
`,

  [`fixtures/${camel}.fixture.ts`]: `import type { ${pascal}Result } from "@/features/${slug}/types";

export const ${camel}Fixture: ${pascal}Result = {
  summary: "example"
};
`,

  "msw/handlers.ts": `import { http, HttpResponse } from "msw";

/** Request mocks used by this slice's tests. Keep responses realistic. */
export const handlers = [
  http.get("https://horizon-testnet.stellar.org/*", () => HttpResponse.json({}))
];
`,

  [`__tests__/${camel}.test.ts`]: `import { describe, expect, it } from "vitest";
import { run${pascal} } from "@/features/${slug}/lib/${camel}";

describe("run${pascal}", () => {
  it("returns a summary for a valid input", async () => {
    const result = await run${pascal}({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});
`,

  "__tests__/schema.test.ts": `import { describe, expect, it } from "vitest";
import { parse${pascal}Input } from "@/features/${slug}/schema";

describe("parse${pascal}Input", () => {
  it("rejects empty input", () => {
    const result = parse${pascal}Input("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parse${pascal}Input("  example  ");
    expect(result.ok && result.value.value).toBe("example");
  });
});
`,

  "__tests__/format.test.ts": `import { describe, expect, it } from "vitest";
import { formatSummary } from "@/features/${slug}/lib/format";

describe("formatSummary", () => {
  it("trims the value", () => {
    expect(formatSummary(" example ")).toBe("example");
  });
});
`,

  [`__tests__/use${pascal}.test.tsx`]: `import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { use${pascal} } from "@/features/${slug}/hooks/use${pascal}";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("use${pascal}", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => use${pascal}(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => use${pascal}(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
  });
});
`,

  [`__tests__/${pascal}Panel.test.tsx`]: `import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { ${pascal}Panel } from "@/features/${slug}/components/${pascal}Panel";
import { copy } from "@/features/${slug}/copy";

describe("${pascal}Panel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<${pascal}Panel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<${pascal}Panel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
`,

  "__tests__/a11y.test.tsx": `import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { ${pascal}Panel } from "@/features/${slug}/components/${pascal}Panel";

describe("${pascal}Panel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<${pascal}Panel />);
    await expectNoAxeViolations(container);
  });
});
`,

  [`e2e/${slug}.spec.ts`]: `/**
 * End-to-end specification for the ${title} tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/${slug}",
  steps: [
    { action: "visit", target: "/tools/${slug}" },
    { action: "expect", target: "heading", value: "${title}" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
`,

  "README.md": `# ${title}

TODO: what this tool does, in two or three sentences.

## How it works

TODO: the data source, the request it makes (or why it makes none), and the
shape of the result.

## Files

| Path | Responsibility |
| --- | --- |
| \`manifest.ts\` | Registry metadata |
| \`schema.ts\` | Input parsing and validation |
| \`lib/\` | Tool logic and error mapping |
| \`hooks/\` | React state machine |
| \`components/\` | Form, result, empty and error UI |
| \`__tests__/\` | Unit, hook, component and accessibility tests |
| \`fixtures/\` | Deterministic sample data |
| \`msw/\` | Request mocks |

## Safety

TODO: state explicitly that this tool never asks for a secret key.
`
};

async function main() {
  for (const [relative, contents] of Object.entries(files)) {
    const target = path.join(dir, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents, "utf8");
  }

  console.log(`Created features/${slug} with ${Object.keys(files).length} files.`);
  console.log("Next: npm run registry && npm run verify:features -- " + slug);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
