# Transaction Result Code Explainer

Explains Stellar transaction and operation result codes in plain language. Paste
a code directly or paste a transaction-result XDR to decode every code it
contains.

## How it works

Two input modes share one offline pipeline:

1. **Result code** — normalises pasted strings (commas, newlines, hyphens) and
   looks them up in a curated table of common `tx_*` and `op_*` codes with
   causes and concrete fixes.
2. **Result XDR** — validates base64, decodes `TransactionResult` with
   `@stellar/stellar-sdk`, extracts the transaction-level code and every
   operation-level inner result, then explains each one.

A search field filters the explanation list by code, title, cause or fix.
Unknown codes are reported honestly — the tool never invents a definition.

## What this tool will not do

It does not fetch transactions from Horizon (use the transaction lookup tool) and
it does not attempt to rebuild or resubmit failed transactions. Nothing is
transmitted, logged or persisted: `msw/handlers.ts` is empty by design.

## Fixtures

Result XDR fixtures are built with the SDK rather than hard-coded base64 so
every run sees the same well-formed bytes.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Input parsing for code and XDR modes |
| `lib/resultCodes.ts` | Curated code table and aliases |
| `lib/resultCodeExplainer.ts` | XDR decoding and explanation assembly |
| `lib/format.ts` | Presentation labels |
| `hooks/` | Synchronous React state machine |
| `components/` | Form, result, empty state and panel |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic result XDR from the SDK |

## Safety

This tool never asks for a secret key and makes no network requests of any kind.
