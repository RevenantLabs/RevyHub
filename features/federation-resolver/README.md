# Federation Address Resolver

Resolves a [SEP-0002](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0002.md)
federated address such as `alice*example.com` to the Stellar account it points
at, plus any memo the receiver requires.

## How it works

Two steps, each with its own failure modes:

1. Fetch `https://<domain>/.well-known/stellar.toml` and read `FEDERATION_SERVER`.
2. `GET` that server with `?q=name*domain&type=name` and validate the reply.

The federation server URL is **never guessed** from the domain. SEP-0002
requires it to be declared, and inventing one would send a name to a host that
never claimed to answer for it. A declared server that is not HTTPS is refused
outright rather than downgraded — the query contains who is being paid.

## Parsing the address

The name and domain are split on the **first** asterisk, per SEP-0002, not the
last. That matters: `a*b*example.com` yields the domain `b*example.com`, which
is not a valid hostname, so the address is rejected. Splitting on the last
asterisk would instead have accepted it as a name `a*b` at `example.com` — a
different and wrong answer. There is a test for exactly this.

## Validating what comes back

A federation server is a third party, so nothing it returns is trusted:

- `account_id` must be present and must pass the StrKey checksum.
- A `memo` without a `memo_type` is rejected — it cannot be attached to a
  transaction, so it is a malformed answer rather than an optional field.
- A text memo is limited to **28 UTF-8 bytes**, not 28 characters. Ten rocket
  emoji are ten characters and forty bytes; a test covers that case.

## The memo warning

When a memo is returned it is shown as a warning, not a detail. A federated
address that carries a memo almost always points at a shared account where the
memo identifies the customer, and a payment sent without it is usually lost.

## Timeouts and cancellation

Each network leg gets its own budget through `AbortSignal`, and a caller signal
is combined with the timeout so either can end the request. A cancelled or
timed-out lookup reports `timeout`, kept distinct from `network_error` — the
first is worth retrying, the second usually is not.
