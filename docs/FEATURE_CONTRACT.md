# The RevyHubX feature contract

Every tool in RevyHubX is a **vertical slice**: one directory under `features/`
that owns its logic, validation, state, UI, tests, fixtures, request mocks and
documentation. Nothing about a tool lives outside its own directory.

This document is the specification each tool issue is written against.
`npm run verify:features` enforces it, and CI runs that check on every pull
request.

---

## Why slices instead of layers

The usual layout — `components/`, `lib/`, `hooks/`, `tests/` — forces every
contributor to edit the same shared files. With dozens of open pull requests
that produces constant conflicts in `constants.ts`, barrel files and route
tables, and none of the work is really independent.

Here, adding a tool means **creating one new directory and editing nothing
else**:

- Routing is a single dynamic route, `app/tools/[slug]/page.tsx`. You do not
  create a route file.
- The registry is **generated** from the directories under `features/` by
  `scripts/generate-registry.mjs`, and the generated files are gitignored. You
  do not edit a registry, a navigation list, or a constants file.
- Navigation, the dashboard and search all read that generated registry, so a
  new tool appears in all three the moment its directory exists.

Two contributors working on two different tools cannot conflict, because they
never touch the same file.

---

## Required layout

```
features/<slug>/
├── manifest.ts                     registry metadata
├── panel.tsx                       default export used by the route
├── types.ts                        the slice's own types and error codes
├── schema.ts                       raw input → validated request
├── copy.ts                         every user-facing string
├── lib/
│   ├── <domain>.ts                 the tool's logic
│   ├── <domain>.errors.ts          transport failures → this tool's codes
│   └── format.ts                   presentation helpers
├── hooks/
│   └── use<Name>.ts                the state machine
├── components/
│   ├── <Name>Panel.tsx             composes the states
│   ├── <Name>Form.tsx              input
│   ├── <Name>Result.tsx            success
│   └── <Name>EmptyState.tsx        the pre-interaction state
├── __tests__/
│   ├── <domain>.test.ts            logic
│   ├── schema.test.ts              validation
│   ├── format.test.ts              formatting
│   ├── use<Name>.test.tsx          hook
│   ├── <Name>Panel.test.tsx        component
│   └── a11y.test.tsx               axe, WCAG 2.1 A/AA
├── fixtures/
│   └── <domain>.fixture.ts         deterministic sample data
├── msw/
│   └── handlers.ts                 request mocks (required if it makes requests)
├── e2e/
│   └── <slug>.spec.ts              end-to-end specification
└── README.md                       what it does, how, and why
```

**Minimum 20 files.** A complete slice lands at 23-25 without padding.

Scaffold the whole structure with:

```bash
npm run new:feature -- <slug> "<Title>" <category>
```

---

## The rules behind the layout

### 1. Logic never throws for expected failures

Anything the user can cause is a value, not an exception. Use
`Result<T, Code>` from `@/core/result/result`:

```ts
if (!StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_address");
return ok({ accountId });
```

Error **codes** are the interface — never English strings. The UI maps codes to
copy. That is what makes messages translatable, testable and refactorable.

### 2. Error codes are specific enough to act on

`request_failed` is a last resort. A user who typed one wrong character and a
user whose account does not exist on the selected network need different
advice, so they get different codes. Every code must map to copy that says what
to do next.

### 3. All strings live in `copy.ts`

No user-facing text inside components. Tests import `copy` and assert against
it, so wording changes never break the test suite.

### 4. Amounts are never parsed as floats

Stellar amounts have 7 decimal places and can exceed `Number.MAX_SAFE_INTEGER`.
Use strings and `BigInt`. `formatAmount` in `features/balance-viewer` is the
reference.

### 5. Four UI states, always

Idle (empty state), loading, success, error. The panel composes them; no state
is skipped because it "rarely happens".

### 6. Network results are tagged and derived

If a tool reads the chain, its result belongs to the network it came from.
Store the network beside the state and derive staleness during render — do not
reset in an effect. `useBalanceViewer` is the reference.

### 7. Accessibility is a test, not an intention

`a11y.test.tsx` runs axe over the real rendered markup and must report zero
WCAG 2.1 A/AA violations, in **at least two states** — usually initial and
"result shown". Use `Field` from `@/core/ui` so labels, hints, `aria-invalid`
and `aria-describedby` are wired correctly for free.

Announce errors once. A field-level error already carries `role="alert"`, so do
not also render a banner for it — see `TrustlineCheckerPanel`.

### 8. Fixtures are derived, never hand-typed

Hand-written Stellar addresses have wrong checksums. Derive them:

```ts
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));
export const accountId = seed(1).publicKey();
```

### 9. Requests are mocked with MSW, never with `vi.mock`

Mock at the network boundary so the test exercises the real client. Call
`resetHorizonClients()` before a request when a test changes handlers — the
Horizon client is memoised per network.

### 10. Never accept, display, store or transmit a secret key

Reject anything starting with `S` on the prefix alone, before any checksum
check, and never render it back. `features/address-validator` has two tests
asserting the seed appears in neither component output nor hook state. Every
slice that takes an address needs the equivalent.

---

## What "done" means

```bash
npm run check     # registry + lint + test + verify:features + build
```

All four must pass, plus:

- [ ] `npm run verify:features -- <slug>` reports OK
- [ ] Every error code has copy that says what to do next
- [ ] `a11y.test.tsx` covers at least two states
- [ ] `README.md` explains the non-obvious decision in the slice, not just what
      the tool does
- [ ] No secret key is ever accepted or echoed
- [ ] Nothing outside `features/<slug>/` was modified

That last line is the important one. If your pull request touches a shared
file, something is wrong with the approach — say so in the issue rather than
working around it.
