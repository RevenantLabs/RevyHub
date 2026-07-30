"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import {
  resolveFederation,
  validateFederationSyntax,
  type FederationErrorCode,
  type FederationResult
} from "@/lib/stellar/federation";

interface ErrorPresentation {
  type: "error" | "warning" | "info";
  title: string;
  description: string;
}

const errorPresentation: Record<FederationErrorCode, ErrorPresentation> = {
  empty: {
    type: "info",
    title: "Awaiting federation address",
    description:
      "Type a federation address in the form name*domain (for example, alice*stellar.org) and press Resolve."
  },
  invalidSyntax: {
    type: "error",
    title: "Invalid federation address",
    description: ""
  },
  httpsRequired: {
    type: "error",
    title: "Federation server must use HTTPS",
    description:
      "stellar.toml declared a federation URL without HTTPS. Compliant Stellar services only publish HTTPS endpoints."
  },
  tomlNotFound: {
    type: "error",
    title: "No stellar.toml on this domain",
    description:
      "The domain did not return a stellar.toml file at /.well-known/stellar.toml. The owner of that domain may not publish Stellar services."
  },
  tomlMalformed: {
    type: "error",
    title: "Malformed stellar.toml",
    description:
      "The stellar.toml body was returned but could not be parsed — the FEDERATION_SERVER declaration was missing, malformed, or not on HTTPS."
  },
  noFederationServer: {
    type: "error",
    title: "No FEDERATION_SERVER declared",
    description:
      "The domain's stellar.toml does not advertise a federation server URL, so names on that domain cannot be resolved."
  },
  federationNotFound: {
    type: "error",
    title: "Federation name not found",
    description:
      "The federation server did not have an entry for that name. Double-check the spelling of both the name and domain parts."
  },
  federationMalformed: {
    type: "error",
    title: "Federation server returned malformed data",
    description:
      "The federation server's response was not in the shape SEP-0002 expects (JSON with an account_id field)."
  },
  federationServerError: {
    type: "error",
    title: "Federation server error",
    description:
      "The federation server returned a non-success HTTP status. Try again, or try a different domain."
  },
  invalidAccountId: {
    type: "error",
    title: "Server returned an invalid Stellar public key",
    description:
      "The account_id from the federation server failed Stellar checksum validation. Treat the response as untrusted."
  },
  invalidMemo: {
    type: "error",
    title: "Memo info from federation server is invalid",
    description:
      "The federation server returned a memo or memo_type that does not match the SEP-0002 protocol. Verify any memo before sending funds."
  },
  timeout: {
    type: "warning",
    title: "Resolution timed out",
    description:
      "The lookup did not complete in time. The domain's server may be slow or unreachable. Try again, or confirm it publishes CORS headers."
  },
  networkError: {
    type: "warning",
    title: "Could not reach the federation server",
    description:
      "The browser could not fetch stellar.toml or the federation server response. The server may be offline, or it may not publish CORS headers required for browser access."
  }
};

export default function FederationResolverPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FederationResult | null>(null);
  const [showSources, setShowSources] = useState(false);

  const syntax = validateFederationSyntax(input);
  const empty = input.trim().length === 0;
  const showValidationHint = !empty && syntax.address === undefined;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const validation = validateFederationSyntax(input);

    if (!validation.valid) {
      setResult({
        kind: "error",
        code: input.trim().length === 0 ? "empty" : "invalidSyntax",
        message: validation.message
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setShowSources(false);

    try {
      const next = await resolveFederation(input);
      setResult(next);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    setInput("");
    setResult(null);
    setShowSources(false);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <CharacterPanel
        tone="wallet"
        eyebrow="Federation postmaster"
        title="Federation Resolver"
        description="A diligent postmaster routes Stellar names like alice*stellar.org to the right public key destinations, fetching stellar.toml and the federation server over HTTPS only."
      />

      <Card className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#29364d]">
              Federation address
            </span>
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="alice*stellar.org"
              spellCheck={false}
              autoComplete="off"
              inputMode="email"
              aria-label="Federation address"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              disabled={loading || empty || !syntax.valid}
            >
              {loading ? "Routing mail…" : "Resolve federation address"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={loading && !input && !result}
            >
              Clear
            </Button>
            {syntax.address ? (
              <Badge tone="info" title="Validated federation syntax">
                {syntax.address.name}*{syntax.address.domain}
              </Badge>
            ) : null}
          </div>
        </form>

        {showValidationHint ? (
          <StatusMessage
            type="warning"
            title="Check the federation address"
            description={syntax.message}
          />
        ) : null}

        {result?.kind === "error"
          ? renderError(result.code, result.message)
          : null}

        {result?.kind === "success" ? (
          <StatusMessage
            type="success"
            title="Resolved federation address"
            description={`${result.address.name}*${result.address.domain} now has a verified Stellar account destination.`}
          />
        ) : null}

        {result?.kind === "success" ? (
          <ResultCard
            result={result}
            showSources={showSources}
            onToggleSources={() => setShowSources((value) => !value)}
          />
        ) : null}
      </Card>

      <SafetyReminder />
    </div>
  );
}

function renderError(code: FederationErrorCode, message: string) {
  const presentation = errorPresentation[code];
  // For invalidSyntax we keep the validator's specific message so the UI can
  // show precise field guidance rather than a generic explanation.
  const description =
    code === "invalidSyntax" ? message : presentation.description;

  return (
    <StatusMessage
      type={presentation.type}
      title={presentation.title}
      description={description}
    />
  );
}

interface ResultCardProps {
  result: Extract<FederationResult, { kind: "success" }>;
  showSources: boolean;
  onToggleSources: () => void;
}

function ResultCard({ result, showSources, onToggleSources }: ResultCardProps) {
  const { record, address, federationServer, tomlUrl } = result;

  return (
    <div className="space-y-4 rounded-lg border border-[#70c7a7]/70 bg-[#e1f8ef] p-4 shadow-[4px_4px_0_rgba(111,212,255,0.22)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-[#17664b]">
          Resolved destination
        </p>
        <Badge tone="success">Account verified</Badge>
      </div>

      <dl className="divide-y divide-[#c7e7da] rounded-lg border border-[#70c7a7]/60 bg-white/72">
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
          <dt className="text-xs uppercase tracking-wide text-[#5d6b82]">
            Federation address
          </dt>
          <dd className="break-words text-sm text-[#172033] sm:col-span-2">
            <span className="font-semibold">{address.name}</span>*
            <span className="font-semibold">{address.domain}</span>
          </dd>
        </div>
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
          <dt className="text-xs uppercase tracking-wide text-[#5d6b82]">
            Account ID
          </dt>
          <dd className="break-all text-sm text-[#172033] sm:col-span-2">
            <CopyableValue
              label="resolved Stellar account ID"
              value={record.accountId}
              visible={8}
            />
          </dd>
        </div>
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
          <dt className="text-xs uppercase tracking-wide text-[#5d6b82]">
            Memo
          </dt>
          <dd className="text-sm text-[#172033] sm:col-span-2">
            {record.memoType ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                <Badge tone="info" title="Memo type from federation server">
                  {record.memoType}
                </Badge>
                {record.memo ? (
                  <CopyableValue
                    label={`federation ${record.memoType} memo`}
                    value={record.memo}
                    visible={10}
                  />
                ) : null}
              </span>
            ) : (
              <span className="text-[#5d6b82]">
                No memo declared by the federation server.
              </span>
            )}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onToggleSources}
        className="text-xs font-extrabold uppercase tracking-wide text-[#146783] hover:text-[#0e4e69]"
      >
        {showSources ? "Hide" : "Show"} federation sources
      </button>
      {showSources ? (
        <dl className="grid gap-3 rounded-lg border border-[#82cbe3]/70 bg-white/72 p-4 text-sm text-[#172033] sm:grid-cols-[140px_1fr]">
          <dt className="text-xs uppercase tracking-wide text-[#5d6b82]">
            stellar.toml
          </dt>
          <dd className="break-all">
            <a
              className="text-[#178fb5] underline hover:text-[#0e4e69]"
              href={tomlUrl}
              target="_blank"
              rel="noreferrer"
            >
              {tomlUrl}
            </a>
          </dd>
          <dt className="text-xs uppercase tracking-wide text-[#5d6b82]">
            Federation server
          </dt>
          <dd className="break-all">
            <a
              className="text-[#178fb5] underline hover:text-[#0e4e69]"
              href={federationServer}
              target="_blank"
              rel="noreferrer"
            >
              {federationServer}
            </a>
          </dd>
        </dl>
      ) : null}
    </div>
  );
}

function SafetyReminder() {
  return (
    <Card className="border-[#ffc3a8]/80 bg-[#fff2e9]">
      <div className="flex gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/70 text-lg">
          ⚠️
        </span>
        <div className="space-y-1 text-sm leading-6 text-[#7a3f2f]">
          <p className="font-extrabold uppercase tracking-wide text-[#9a513f]">
            Always verify account and memo before sending
          </p>
          <p>
            Federation results are untrusted until you confirm them yourself.
            Cross-check the account ID against its issuer, verify any memo with
            the counterparty, and never send funds based solely on a federation
            lookup.
          </p>
        </div>
      </div>
    </Card>
  );
}
