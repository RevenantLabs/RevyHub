# SEP-6 Capability Evidence Auditor

Shows the deposit, withdraw, and exchange capabilities declared in a pasted SEP-6 `/info` response. It does not call the anchor.

## How it works

Each asset is listed under its own direction. `enabled` and `authentication_required` stay unset when the anchor omitted them. Amounts are compared as exact decimals; a minimum above the maximum is incompatible rather than silently swapped. A fee is "absent" when neither `fee_fixed` nor `fee_percent` was declared. Unknown fields are kept. A non-object capability record is marked malformed.

## Limits

HTTPS anchor URL only, as a label for the paste. No deposit, withdraw, or customer request is sent. Documents over 40,000 characters are refused.

## Safety

This tool never asks for a secret key. A secret-seed-shaped token is rejected and is not copied into the result.
