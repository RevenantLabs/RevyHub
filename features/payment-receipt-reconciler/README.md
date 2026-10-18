# Payment Receipt Reconciler

Turn one completed classic payment or path-payment transaction into a public
receipt that connects its operations with observed account debit and credit
effects — without promising a full accounting export.

## Behaviour

1. Validate a 64-character transaction hash locally (`invalid_hash` /
   `empty_input`).
2. Fetch Horizon `GET /transactions/{hash}`, `/operations` and `/effects` on
   the selected network.
3. Reject absent (`transaction_not_found`) or failed (`transaction_failed`)
   transactions with specific outcomes.
4. Keep only `payment`, `path_payment_strict_send` and
   `path_payment_strict_receive` operations; everything else is listed under
   **Outside this receipt**.
5. Link each supported operation to its `account_debited` / `account_credited`
   effects via the operation TOID embedded in the effect id. Missing either
   side yields `incomplete_effects`.
6. Sum exact amounts by asset code + issuer (`BigInt` stroops). The charged fee
   is shown separately and never folded into debit totals.
7. Produce a copyable public receipt: hash, selected network, ledger number.
   Operation and effect ids stay visible for audit.

## Data boundaries

- Networks: testnet and mainnet Horizon only.
- Amounts stay strings / `BigInt` — never floats, never secret keys.
- Trade, trustline and other non-transfer effects are marked outside the
  receipt rather than silently dropped.
- No payment initiation or tax classification.

## Design decisions

- Effect linking uses the Horizon effect id (`{operationTOID}-{index}`) rather
  than guessing from accounts or amounts, so multi-op transactions stay exact.
- Failed transactions are an error outcome for this tool (unlike Transaction
  Lookup) because a failed payment has no durable debit/credit receipt.
- Transport failures and decode problems collapse to `request_failed`; domain
  outcomes keep their own codes so copy stays actionable.
