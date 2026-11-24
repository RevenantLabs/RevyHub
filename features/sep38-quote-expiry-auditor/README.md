# SEP-38 Quote Expiry and Terms Auditor

Audits one pasted SEP-38 firm quote at an explicit evaluation time. It does not request, refresh, or accept a quote, and it does not talk to an anchor.

## How it works

The caller supplies the anchor identifier, an ISO-8601 evaluation instant (a `Z` suffix or a numeric offset), and the quote JSON. Identity, sell/buy assets, and amount strings are checked exactly. `expires_at` is active only while the evaluation instant is strictly earlier; the equal instant is expired. A fee charged in a different asset stays visible. Missing price or fee fields produce an incomplete result instead of a zero. A quote that names another anchor, compares two quotes, or uses the same asset on both sides is refused.

## Limits

One quote, at most 20,000 characters. No JWT, no quote id lookup, and no promise that the anchor will still honor the quote. Secret seeds are rejected and never rendered.

## Safety

This tool never asks for a secret key. A value with the `S` seed shape is refused before it is parsed or stored in the result.
