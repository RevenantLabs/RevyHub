# Batch Operation Summary

Decodes a pasted transaction envelope locally and reports operation counts, native XLM moved and every source account override. It never signs, submits, logs or transmits XDR.

## Exact accounting

Amounts remain integer stroops (`BigInt`) until presentation. Payment destination amounts, strict-send send amounts and strict-receive destination amounts contribute only when that side is native XLM; issued assets are intentionally not merged into a unitless total.

## Boundaries

Input is capped at 200,000 characters before decoding. Classic v0, v1 and fee-bump inner transactions are supported. Operation source overrides are distinct from the transaction source and de-duplicated.

## Safety

This offline feature accepts only public transaction-envelope XDR and never asks for a secret key.
