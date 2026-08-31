# Multisig Signature Weight Analyzer

This tool decodes a pasted Stellar transaction envelope, fetches the account signer weights from Horizon, and calculates whether the signatures already on the envelope are enough to satisfy the required threshold. It also calls out any remaining signer weight and any signatures that cannot be matched to a signer by hint.

## How it works

The form takes two public inputs only: the base64 transaction envelope and the source account address on the selected network. The XDR is decoded locally in-process, and the tool then calls Horizon `GET /accounts/{account_id}` for the signer list and threshold values. Each signature is matched to a signer by its 4-byte hint, and the result reports the highest required threshold across the transaction's operations, the current combined weight, the remaining shortfall, and the signers that could still close the gap.

The non-obvious rule here is that operations with their own source account must be evaluated against that operation source, not the transaction source. A payment from a sub-account or a custom source account can require a different signer set than the transaction source account even when they share the same envelope.

## Safety

This tool never asks for a secret key, never displays one, never stores one, and never signs or submits a transaction.
