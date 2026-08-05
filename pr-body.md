## Summary

Add an explicit privacy mode that masks account IDs, transaction hashes, issuers, and other long identifiers in result views and screenshots.

Closes #168

## Changes

### `lib/utils.ts`
- Added **`redactValue(value)`** — masks long identifiers preserving type context:
  - Stellar G-keys: `G••••••••Q7H6` (1-char prefix, 8 masked, 4 trailing)
  - Hashes & other strings: `ab••••••••6789` (2-char prefix)
  - Short strings (< 12 chars) unchanged; defensive guard prevents expanding

### `components/stellar/RedactionProvider.tsx` *(new)*
- React context providing `redacted` boolean + `setRedacted` toggle
- Follows the `NetworkProvider` pattern used throughout the app

### `components/stellar/CopyableValue.tsx`
- When redacted: shows `EyeOff` icon + masked value in muted colour, copy button disabled with "Locked" label, `aria-label="Redacted [label]"`
- When not redacted: normal behaviour preserved

### `components/layout/AppHeader.tsx`
- Privacy toggle button with `Eye`/`EyeOff` icons and "Masked" badge
- Sits next to the Network selector in the header bar

### `components/layout/AppShell.tsx`
- Wrapped with `RedactionProvider` inside `NetworkProvider`

### Tests — 2 new files, 10 new tests
| File | Tests | What it covers |
|---|---|---|
| `tests/redaction.test.ts` | 8 | `redactValue` for Stellar keys, hashes, issuers, short strings, G-prefix detection, length guard |
| `tests/redaction-behavior.test.tsx` | 2 | `CopyableValue` masked rendering, disabled copy, accessible labels in redacted & normal modes |

## Validation

- ✅ Lint passes (`npm run lint`)
- ✅ All 28 tests pass (`npm test`)
- ✅ Production build succeeds (`npm run build`)

## Acceptance criteria met

- [x] Redaction is opt-in (toggle in header), clearly indicated ("Masked" badge), consistent across all `CopyableValue` instances
- [x] Masked values preserve type context (`G` prefix, `••••••••` block, last 4 chars)
- [x] Copy actions disabled while redaction is active (button shows "Locked", `disabled` attribute set)
- [x] Setting is local-only (React state), doesn't alter fetched data or URL params
- [x] Screen readers receive `aria-label="Redacted [label]"` and `title="Redacted [label]"`
