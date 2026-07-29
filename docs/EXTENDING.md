# Extending RevyHubX with a New Tool

This guide turns the architecture overview into an actionable tutorial. Follow it to add a small example tool through UI, utility, test, and navigation layers without asking users for secret keys.

## Where Things Belong

| Layer | Path | Responsibility |
| --- | --- | --- |
| Tool page | `app/tools/<tool-slug>/page.tsx` | Form state, loading/error copy, layout for one tool |
| Shared UI | `components/ui/` | Buttons, cards, status messages |
| Stellar display | `components/stellar/` | Address inputs, QR preview, balance lists |
| Stellar logic | `lib/stellar/` | Validation, Horizon/Friendbot helpers (no secrets) |
| Navigation metadata | `lib/constants.ts` | Home-page tool cards (`title`, `description`, `href`, `status`, `icon`) |
| Tests | `tests/stellar/` | Unit/component coverage for new helpers |

Do **not** call the Stellar SDK directly from a page. Put SDK work under `lib/stellar/` and import helpers into the page.

## Example: Memo Length Checker

The walkthrough below adds a fictional **Memo Length Checker** tool. Adapt names to your feature.

### 1. Add a pure helper

Create `lib/stellar/memoLength.ts`:

```ts
export function checkMemoLength(memo: string) {
  const value = memo.trim();

  if (!value) {
    return { ok: false, message: "Enter a memo to check its length." };
  }

  const byteLength = new TextEncoder().encode(value).length;

  if (byteLength > 28) {
    return {
      ok: false,
      message: `Memo is ${byteLength} bytes. Stellar text memos must be 28 bytes or fewer.`
    };
  }

  return {
    ok: true,
    message: `Memo looks valid for a text memo (${byteLength}/28 bytes).`
  };
}
```

Never accept or store secret keys / seed phrases in helpers or pages.

### 2. Cover it with a unit test

Create `tests/stellar/memoLength.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { checkMemoLength } from "@/lib/stellar/memoLength";

describe("checkMemoLength", () => {
  it("rejects empty input with a clear message", () => {
    expect(checkMemoLength("").ok).toBe(false);
  });

  it("accepts memos within the text memo byte limit", () => {
    expect(checkMemoLength("Invoice 1001").ok).toBe(true);
  });

  it("rejects multibyte memos that exceed 28 UTF-8 bytes", () => {
    // 8 emoji × 4 UTF-8 bytes = 32 bytes, even though value.length is 8
    expect(checkMemoLength("🎉".repeat(8)).ok).toBe(false);
  });
});
```

Run:

```bash
npm run test
```

### 3. Add the tool page

Create `app/tools/memo-length/page.tsx` as a client page that:

- Uses `CharacterPanel`, `Card`, `Input`, and `StatusMessage`
- Calls `checkMemoLength` for validation
- Shows `info` when empty, `success` / `error` when the user typed something

Mirror the structure of `app/tools/address-validator/page.tsx`.

### 4. Register navigation metadata

Add an entry to `tools` in `lib/constants.ts`:

```ts
{
  title: "Memo Length Checker",
  description: "Check whether a text memo fits Stellar's 28-byte limit.",
  character: "A tiny clipboard counts memo UTF-8 bytes.",
  href: "/tools/memo-length",
  status: "MVP",
  icon: Search // or another lucide-react icon already imported
}
```

The home page (`app/page.tsx`) renders `tools` automatically — no extra nav wiring.

### 5. User-facing error states

Every tool should:

- Explain empty / idle state in English
- Map helper failures to `StatusMessage` with `type="error"`
- Keep secret-key warnings visible when touching addresses or wallets
- Label testnet-only behavior when Friendbot or test funds are involved

### 6. Quality gates

Before opening a PR:

```bash
npm run lint
npm run test
npm run build
```

These match the GitHub Actions checks described in [ARCHITECTURE.md](./ARCHITECTURE.md).

### 7. PR checklist for a new tool

- [ ] Helper under `lib/stellar/` (or pure `lib/` if non-Stellar)
- [ ] Page under `app/tools/<slug>/page.tsx`
- [ ] Navigation entry in `lib/constants.ts`
- [ ] Tests under `tests/`
- [ ] English copy only; no secret-key collection
- [ ] Linked GitHub issue (`Closes #…`) for Wave / GrantFox tracking

## Related Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — layer overview and quality gates
- [CONTRIBUTING.md](../CONTRIBUTING.md) — branch, commit, and PR expectations
- [STELLAR_BASICS.md](./STELLAR_BASICS.md) — Stellar concepts for new contributors
- [ISSUES.md](./ISSUES.md) — scoped contributor issue ideas
