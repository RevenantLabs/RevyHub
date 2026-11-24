# SEP-31 Transfer Field Readiness Checker

Compares a local field map with a recorded SEP-31 requirement document. It does not send a transfer, call SEP-12, or store customer data.

## How it works

Pick an anchor identifier, an asset code, and sender or receiver. The checker uses only that slice of the pasted requirements. Required names that are missing, choices outside the declared list, and names the requirements do not mention are listed by name and reason. Supplied values are not copied into the result, and the field-map box is cleared after a successful check. An empty `fields` object is an empty result. A field marked both required and optional is rejected instead of being reported as ready.

## Limits

One asset and one context at a time. Each JSON document is capped at 20,000 characters. This is not a regulatory approval.

## Safety

This tool never asks for a secret key. A secret-seed-shaped token is rejected and is not copied into the result.
