# Account Signers and Thresholds

Loads an account's public Horizon record and explains every signer, its weight,
and the low, medium, and high authorization thresholds. It also identifies the
master key, disabled master-key setups, and thresholds that no combination of
the current signers can reach.

## How it works

The form accepts only a checksum-valid public `G...` account address. The slice
calls Horizon `GET /accounts/{account_id}` on the selected network, normalizes
the `signers` and `thresholds` fields, and stores the result alongside that
network so a network switch cannot leave stale authorization data visible.

Signer weights and thresholds are converted to decimal strings immediately.
Their total and comparisons use `BigInt`, never floating-point arithmetic. The
request is read-only and all expected Horizon failures return a typed `Result`.

## Threshold descriptions

- Low gates trust authorization changes and sequence bumps.
- Medium gates everyday operations such as payments, offers, trustlines,
  account data, sponsorships, and contract calls.
- High gates account-control changes through Set Options, including signer and
  threshold updates.

## Non-obvious decision

A freshly funded account has one master signer of weight 1 and thresholds of
0. Treating that as an unexplained one-row signer table makes it look like a
multisig configuration, so the result explicitly describes it as a normal,
non-multisig account. In contrast, a master signer with weight 0 is preserved
as deliberate ledger state and prominently called out as disabled rather than
treated as an error.

## Safety

This tool reads public account data only. It rejects secret-seed input before a
checksum check, never includes input values in hook state, and never signs or
submits a transaction.
