# SEP-0007 URI Signature Verifier

Checks a `web+stellar:` request against the `URI_REQUEST_SIGNING_KEY` published by its declared `origin_domain`.

The verifier preserves the URI's original query encoding and ordering while removing only the `signature` parameter. It then builds the SEP-0007 signing payload (35 zero bytes, `0x04`, URI, and the protocol suffix) before local Ed25519 verification. A valid signature proves that domain signed the request; it does not make the payment safe or advisable.

## How it works

The input is parsed locally to identify the declared origin domain, signature,
and the exact unsigned URI bytes. The tool fetches only
`https://<origin_domain>/.well-known/stellar.toml`, extracts
`URI_REQUEST_SIGNING_KEY`, and verifies the SEP-0007 payload with Ed25519. The
payload is the 36-byte selector, followed by `stellar.sep.7 - URI Scheme` and
the unsigned URI. A
successful result includes the verified domain, key, and TOML URL; failures use
specific codes so missing keys, unreachable domains, and invalid signatures are
not conflated.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Input parsing and validation |
| `lib/` | Tool logic and error mapping |
| `hooks/` | React state machine |
| `components/` | Form, result, empty and error UI |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic sample data |
| `msw/` | Request mocks |

## Safety

This tool never asks for, accepts, displays, stores, or transmits a secret key.
Verification establishes only that the published domain signed the request; it
does not recommend sending a payment.
