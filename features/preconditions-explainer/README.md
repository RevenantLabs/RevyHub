# Transaction Preconditions Explainer

Reads the preconditions a transaction declares — time bounds, ledger bounds,
minimum sequence number, minimum sequence age, minimum sequence ledger gap and
extra signers — and says whether they are open right now.

Preconditions are the usual reason a transaction that looks correct is
rejected. `txTOO_EARLY` and `txTOO_LATE` both mean "your envelope is fine, the
window is not", and working that out from raw XDR by hand is slow and easy to
get wrong.

## How it works

The envelope is decoded locally. The only request is
`GET /ledgers?order=desc&limit=1`, which supplies the two numbers the envelope
cannot: the current ledger sequence and its close time.

A fee bump is described by its **inner** transaction. The wrapper only pays the
fee; the preconditions that gate inclusion belong to the transaction that
actually executes.

Bounds are `uint64` seconds and `uint32` ledger numbers, so they are carried as
strings and compared as `BigInt` from the decoder to the formatter. A bound
past the range of `Date` is reported as out of range rather than rendered as
`Invalid Date`.

## The non-obvious decisions

**A missing ledger degrades the answer instead of replacing it.** The failure
is carried on the successful result as `degradedReason`, not returned as an
error. Everything the envelope declares was decoded without the network, and
throwing that away to show an error page would hide the part of the answer that
is still completely valid — time bounds evaluate fine against the device clock,
and ledger bounds are simply shown as declared but unevaluated. That is why
`ledger_unavailable` and `request_failed` appear inside a success state.

**"No preconditions" is a finding, not a failure.** It travels as the
`no_preconditions` code, because the error-code union is how this slice names
outcomes that have no result object to render. But the panel announces it
politely, with `role="status"` rather than `role="alert"`, because "valid
indefinitely" is the answer the reader came for. The copy also states the
consequence, which is the part people miss: a signed transaction with no time
bounds never stops being submittable, so anyone who obtains a copy can submit
it later.

**The reference clock is the ledger's, not yours.** Time bounds are evaluated
against the close time of the newest closed ledger, because that is what
stellar-core compares against — not the browser's clock, which can be minutes
out. When the snapshot is missing, the tool falls back to the device clock and
says so in the `Compared against` row rather than quietly changing its mind.

**The bounds conventions differ, and both are stated.** `minTime` and `maxTime`
are inclusive: stellar-core rejects only when `maxTime < closeTime`.
`maxLedger` is exclusive: a transaction is already invalid *on* that ledger.
Getting these backwards is a one-ledger, one-second class of bug, so the UI
spells both out instead of relying on the reader's memory.

**The verdict covers only what the envelope and the ledger can settle.**
Minimum sequence number, minimum sequence age and minimum sequence ledger gap
all gate on the *source account's* state, which this tool does not read. They
are explained in terms of what they gate and flagged `Needs the source
account`, rather than folded into a verdict that would then be wrong.

## What this tool will not do

It never signs and never submits, and it refuses a secret key on the `S` prefix
alone — before any decoding, before any request. A 56-character seed is base32,
which is also legal base64 of a legal length, so without that first check a
pasted secret would pass the syntax test and be handed to the decoder.

It also does not build preconditions. Reading is a safe operation on a
stranger's envelope; constructing one is not what this tool is for.

## Fixtures

Every address and envelope is derived from a fixed raw seed and built with the
SDK, so checksums are real and the bytes are identical on every machine.
