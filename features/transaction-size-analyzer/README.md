# Transaction Envelope Byte-Size Analyzer

Measures what a transaction envelope actually weighs, and itemises where the
bytes went.

## How it works

Every size in this tool is read back from the XDR encoder — `toXDR().length` on
the decoded object — never computed from a size table the tool maintains
separately. The encoder is the only thing that knows the real answer, and a
hand-maintained table would drift from the protocol the moment a field is
added.

The pasted base64 is decoded, then re-encoded, which gives three numbers that
are deliberately kept apart:

- **XDR bytes** — what the network carries. The real number.
- **Normalized base64 length** — the re-encoded string, whitespace-free.
- **Pasted base64 length** — what arrived, after whitespace was stripped.

Base64 turns every three bytes into four characters, so the string is always
about a third longer than the payload. That gap is reported explicitly, because
mistaking one for the other is the specific confusion this tool exists to
settle.

## The non-obvious decision

**A breakdown is only shown if it can be proven exhaustive.**

The sections are derived, not assumed. Each vector is measured as XDR actually
encodes it — a 4-byte element count followed by each element — and the
transaction body is then whatever is left after subtracting the vectors and the
discriminant. That subtraction is what makes the sections exhaustive by
construction rather than by hope.

Before rendering, the tool adds its own sections back up and compares them to
the measured total. If they do not match exactly, `breakdownComplete` goes
false, **the sections are dropped**, and the UI shows the measured total with a
message saying the itemisation was withheld.

The alternative — showing sections that nearly add up, or quietly inventing a
"other / remaining" bucket to absorb the difference — would be worse than
showing nothing. Someone debugging an oversized payload needs numbers they can
trust to be complete; a breakdown that is 95 % right sends them looking in the
wrong place. Withholding it is the honest failure mode, and the same check is
what lets a future envelope variant degrade safely instead of silently lying.

The UI proves it too: the measured total of the sections is rendered as its own
row beside them, so a reader can add the column up themselves.

## Fee bumps are counted once

A fee-bump envelope contains a complete inner envelope. The inner envelope's
size appears exactly once in the outer breakdown, as the `inner_envelope`
section, and that same number is the inner layer's own total. The inner layer
then splits *that* number into its own discriminant, body, operations and
signatures.

So both layers sum correctly and the inner transaction is never added twice —
there is a test asserting the outer section equals the inner total, and another
asserting the outer total is less than twice the inner total.

## The budget field

The budget is optional and parsed with a digits-only regex, not `Number()`.
`Number()` accepts `"1e3"`, `"0x10"`, `"12.9"` and `" 12 "` — none of which a
user meant to type into a byte field, and all of which would silently become a
budget they did not choose. Those are `invalid_budget`, and a blank field means
*no budget* rather than a budget of zero.

Headroom and overage are never both reported; one is always zero.

A budget is **your** limit. Whether a transaction is accepted depends on
protocol limits, Soroban resource fees and ledger conditions at the time, none
of which can be read from a payload size, so no acceptance guarantee is
hard-coded or implied.

## Fixtures

Envelopes are built with the SDK from fixed raw seeds so every measurement is
identical on every machine: one operation and two, no signatures, one and two,
a one-character memo and a 28-character one, a fee bump with a signed and an
unsigned outer layer, and a v0 envelope re-wrapped at the XDR level. Each pair
exists to move exactly one section and leave the others untouched, which is
what the tests assert.

Nothing is transmitted: `msw/handlers.ts` is empty by design.
