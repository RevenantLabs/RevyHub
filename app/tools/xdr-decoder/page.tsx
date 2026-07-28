"use client";

import { useState } from "react";
import { EnvelopeDetails } from "@/components/stellar/EnvelopeDetails";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { decodeTransactionEnvelope, type DecodedEnvelope } from "@/lib/stellar/transaction";

export default function XdrDecoderPage() {
  const [xdrInput, setXdrInput] = useState("");
  const [envelope, setEnvelope] = useState<DecodedEnvelope | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ 
    type: "info" as "info" | "success" | "error", 
    text: "The cipher owl waits for a transaction envelope XDR string to decode." 
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setEnvelope(null);

    try {
      const decoded = decodeTransactionEnvelope(xdrInput);
      setEnvelope(decoded);
      setMessage({ 
        type: "success", 
        text: `The cipher owl decoded a ${decoded.envelopeType.replace("ENVELOPE_TYPE_", "")} envelope with ${decoded.operations.length} operation(s).` 
      });
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Unexpected decoding error." 
      });
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setXdrInput("");
    setEnvelope(null);
    setMessage({ 
      type: "info", 
      text: "The cipher owl waits for a transaction envelope XDR string to decode." 
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <CharacterPanel
        tone="cipher"
        eyebrow="Cipher owl"
        title="XDR Decoder"
        description="The cipher owl decodes transaction envelope XDR strings locally in your browser, revealing envelope type, source account, sequence, fee, memo, operations, and signatures without network submission."
      />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#29364d]">Transaction envelope XDR</span>
            <textarea
              value={xdrInput}
              onChange={(event) => setXdrInput(event.target.value)}
              placeholder="Paste base64-encoded transaction envelope XDR here..."
              spellCheck={false}
              rows={6}
              className="min-h-12 w-full rounded-md border border-[#c7d6e8] bg-white/78 px-4 py-3 text-sm text-[#172033] outline-none transition placeholder:text-[#8a98aa] focus:border-[#47a8c7] focus:ring-2 focus:ring-[#8edcf4]/35"
            />
          </label>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Decoding..." : "Decode XDR"}
            </Button>
            {xdrInput && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-md border border-[#c7d6e8] bg-white/60 px-4 py-2 text-sm font-semibold text-[#4e5c73] transition hover:bg-white/80"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </Card>
      
      <div className="rounded-lg border border-[#ffd1c6]/80 bg-[#fff7f1]/75 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9a6754]">Privacy & Security</p>
        <ul className="mt-2 space-y-1 text-sm text-[#4e5c73]">
          <li>• All decoding happens locally in your browser</li>
          <li>• XDR is never sent to any server or logged</li>
          <li>• No network requests are made during decoding</li>
          <li>• Your XDR is not persisted or added to the URL</li>
        </ul>
      </div>

      <StatusMessage type={message.type} title="Cipher owl report" description={message.text} />
      {envelope ? <EnvelopeDetails envelope={envelope} /> : null}
    </div>
  );
}
