"use client";

import { useState } from "react";
import { EnvelopeDetails } from "@/components/stellar/EnvelopeDetails";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Textarea } from "@/components/ui/Textarea";
import {
  inspectTransactionXdr,
  MAX_XDR_INPUT_LENGTH,
  NETWORK_PASSPHRASE_NOTE,
  type TransactionEnvelopeSummary
} from "@/lib/stellar/xdrInspector";

export default function XdrInspectorPage() {
  // The pasted XDR lives only in this component's state: it is never logged,
  // stored, placed in the URL, or sent over the network.
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState<TransactionEnvelopeSummary | null>(null);
  const [message, setMessage] = useState({
    type: "info" as "info" | "success" | "error",
    text: "The archivist reads transaction envelopes entirely on your device. Nothing you paste here leaves the page."
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = inspectTransactionXdr(input);

    if (result.ok) {
      setSummary(result.summary);
      setMessage({ type: "success", text: "The archivist unrolled the envelope and catalogued its contents below." });
    } else {
      setSummary(null);
      setMessage({ type: "error", text: result.message });
    }
  }

  function handleClear() {
    setInput("");
    setSummary(null);
    setMessage({
      type: "info",
      text: "The archivist reads transaction envelopes entirely on your device. Nothing you paste here leaves the page."
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <CharacterPanel
        tone="lens"
        eyebrow="Lens-eyed archivist"
        title="XDR Inspector"
        description="The lens-eyed archivist decodes transaction-envelope XDR locally, so you can review an unsigned or partially signed transaction before it goes anywhere near the network."
      />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#29364d]">Transaction envelope XDR (base64)</span>
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="AAAAAgAAAAA..."
              maxLength={MAX_XDR_INPUT_LENGTH}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="submit">Inspect envelope</Button>
            <Button type="button" variant="secondary" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </form>
      </Card>
      <StatusMessage type={message.type} title="Archivist report" description={message.text} />
      {summary ? (
        <>
          <EnvelopeDetails summary={summary} />
          <StatusMessage type="info" title="About networks and signatures" description={NETWORK_PASSPHRASE_NOTE} />
        </>
      ) : null}
    </div>
  );
}
