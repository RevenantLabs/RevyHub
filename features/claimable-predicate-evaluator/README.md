# Claimable Balance Predicate Evaluator

This offline tool evaluates a pasted Horizon claimable-balance JSON object or a base64 `ClaimPredicate` XDR value for a public claimant address at an explicit UTC second. It does not fetch balances, connect a wallet, or submit transactions.

The protocol arms are unconditional, before absolute time, before relative time, NOT, AND, and OR. “After” is represented by NOT around a before predicate. Before is strict: the branch is false at its deadline. Relative deadlines use the actual creation ledger close time plus the encoded duration. The tool never treats `last_modified_time` as creation time. If creation time is absent, the relative branch is unknown; three-valued AND/OR/NOT preserve that gap unless another branch decides the result. A missing claimant is likewise unknown.

JSON must have a `claimants` array of valid `{destination, predicate}` entries. Predicate unions require exactly one arm, except Horizon's paired `abs_before` and `abs_before_epoch` fields, which must agree. `abs_before` accepts a whole-second UTC ISO time or unsigned epoch string, `abs_before_epoch` an unsigned epoch string, and `rel_before` an unsigned second string or safe integer. Unsafe JSON numbers are rejected to avoid rounding. XDR uses the installed Stellar SDK's checked `ClaimPredicate` type. Amounts and 64-bit times remain strings or BigInt. The tree is limited to 16 levels and 128 nodes; JSON is limited to 100,000 characters, XDR to 16,384, and a balance to 10 claimants. If any branch lacks creation context, the overall verdict stays unknown even when another branch is decisive; the tree still shows the logical branch decisions.

Evidence comes solely from the user's pasted text, claimant address, evaluation time and optional creation time. A true predicate result does not prove that the balance still exists, that the selected network contains it, or that a claim transaction will succeed. No secret seed is accepted, retained, logged or displayed. Pasted content is rendered as inert React text.

Protocol reference: [Stellar claimable balances guide](https://developers.stellar.org/docs/build/guides/transactions/claimable-balances).

The browser journey in `e2e/claimable-predicate-evaluator.spec.ts` can be run with `npx playwright test --config features/claimable-predicate-evaluator/playwright.config.ts` after `npm run build`. It writes desktop and mobile result screenshots under `e2e/screenshots/`.
