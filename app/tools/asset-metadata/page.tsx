"use client";

import { useState } from "react";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { fetchStellarToml, type StellarTomlResult } from "@/lib/stellar/stellarToml";

export default function AssetMetadataPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StellarTomlResult | null>(null);
  const [message, setMessage] = useState<{
    type: "info" | "success" | "error" | "warning";
    text: string;
  }>({
    type: "info",
    text: "Enter an issuer domain to fetch its stellar.toml metadata."
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const tomlResult = await fetchStellarToml(domain);
      setResult(tomlResult);
      setMessage({
        type: "success",
        text:
          tomlResult.currencies.length > 0
            ? `Found ${tomlResult.currencies.length} declared ${tomlResult.currencies.length === 1 ? "currency" : "currencies"} in stellar.toml.`
            : "The stellar.toml was fetched successfully but declares no CURRENCIES entries."
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unexpected error fetching stellar.toml."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <CharacterPanel
        tone="star"
        eyebrow="Star librarian"
        title="Asset Metadata Inspector"
        description="The star librarian fetches /.well-known/stellar.toml from an issuer domain and presents declared currencies with full provenance."
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#29364d]">Issuer domain</span>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com or https://example.com"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <p className="text-xs text-[#68758a]">
              Only HTTPS domains are accepted. Paths and query strings are ignored.
            </p>
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? "Fetching..." : "Inspect stellar.toml"}
          </Button>
        </form>
      </Card>

      <StatusMessage
        type={message.type}
        title="Inspector report"
        description={message.text}
      />

      {result && (
        <div className="space-y-4">
          {/* Provenance block */}
          <div className="rounded-lg border border-white/80 bg-white/68">
            <div className="border-b border-[#c7d6e8] px-4 py-3">
              <p className="text-sm font-semibold text-[#172033]">Fetch provenance</p>
            </div>
            <dl className="divide-y divide-[#c7d6e8]">
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                <dt className="text-xs uppercase tracking-wide text-[#68758a]">Fetched URL</dt>
                <dd className="break-all text-sm text-[#29364d] sm:col-span-2">
                  <a
                    href={result.fetchUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-[#178fb5] underline underline-offset-2 hover:text-[#0f6b8a]"
                    aria-label={`Open ${result.fetchUrl} in a new tab (external)`}
                  >
                    {result.fetchUrl}
                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                  </a>
                </dd>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                <dt className="text-xs uppercase tracking-wide text-[#68758a]">Fetched at</dt>
                <dd className="text-sm text-[#29364d] sm:col-span-2">
                  {new Date(result.fetchedAt).toLocaleString()} (
                  <span className="font-mono">{result.fetchedAt}</span>)
                </dd>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                <dt className="text-xs uppercase tracking-wide text-[#68758a]">Currencies declared</dt>
                <dd className="text-sm text-[#29364d] sm:col-span-2">
                  {result.currencies.length}
                </dd>
              </div>
            </dl>
          </div>

          {/* Untrusted-content notice */}
          <div className="flex items-start gap-3 rounded-lg border border-[#ffc3a8]/80 bg-[#fff2e9] px-4 py-3 text-[#9a513f]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="text-xs leading-5">
              External links, image URLs, and home-domain values shown below originate
              from the issuer&apos;s stellar.toml and are not verified or endorsed by
              this tool. Treat them as untrusted content.
            </p>
          </div>

          {/* Currency cards */}
          {result.currencies.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-[#172033]">Declared currencies</p>
              {result.currencies.map((currency, idx) => (
                <div
                  key={`${currency.code}-${idx}`}
                  className="rounded-lg border border-white/80 bg-white/68"
                >
                  <div className="flex flex-wrap items-center gap-3 border-b border-[#c7d6e8] px-4 py-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#8edcf4]/30 text-xs font-black text-[#146783]">
                      {currency.code.slice(0, 2)}
                    </span>
                    <span className="text-sm font-black text-[#172033]">{currency.code}</span>
                    {currency.name && (
                      <span className="text-sm text-[#4e5c73]">&mdash; {currency.name}</span>
                    )}
                  </div>
                  <dl className="divide-y divide-[#c7d6e8]">
                    {currency.issuer && (
                      <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                        <dt className="text-xs uppercase tracking-wide text-[#68758a]">Issuer</dt>
                        <dd className="text-sm text-[#29364d] sm:col-span-2">
                          <CopyableValue label="issuer address" value={currency.issuer} visible={8} />
                        </dd>
                      </div>
                    )}
                    {currency.desc && (
                      <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                        <dt className="text-xs uppercase tracking-wide text-[#68758a]">Description</dt>
                        <dd className="text-sm text-[#29364d] sm:col-span-2">{currency.desc}</dd>
                      </div>
                    )}
                    {currency.home_domain && (
                      <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                        <dt className="text-xs uppercase tracking-wide text-[#68758a]">Home domain</dt>
                        <dd className="break-all text-sm text-[#29364d] sm:col-span-2">
                          {/* home_domain is issuer-supplied, display as plain text only */}
                          {currency.home_domain}
                        </dd>
                      </div>
                    )}
                    {currency.image && (
                      <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                        <dt className="text-xs uppercase tracking-wide text-[#68758a]">Image URL</dt>
                        <dd className="break-all text-sm text-[#29364d] sm:col-span-2">
                          {/* Image URL is shown as plain text; clicking is intentionally not provided */}
                          <span className="font-mono text-xs">{currency.image}</span>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          ) : (
            <StatusMessage
              type="warning"
              title="No currencies declared"
              description="The stellar.toml file was fetched and parsed but contains no [[CURRENCIES]] entries."
            />
          )}
        </div>
      )}
    </div>
  );
}
