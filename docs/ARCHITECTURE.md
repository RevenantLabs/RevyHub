# Architecture

RevyHubX is a Next.js App Router application built from two parts: a small
stable **core** and any number of independent **feature slices**.

```
core/        shared kernel — changes rarely, reviewed carefully
features/    one directory per tool — added freely, never collides
app/         three files: layout, dashboard, and one dynamic tool route
scripts/     registry generation, scaffolding, contract verification
```

## core/

| Module | Responsibility |
| --- | --- |
| `core/result` | `Result<T, Code>` — the shared success/failure shape |
| `core/network` | Network selection, URLs, passphrases, `NetworkProvider` |
| `core/horizon` | Memoised Horizon client and the shared error taxonomy |
| `core/rpc` | Minimal Soroban JSON-RPC caller |
| `core/registry` | Feature manifest types and the generated registry |
| `core/ui` | Accessible primitives: `Field`, `StatusMessage`, `DataList`, … |
| `core/layout` | App shell, header, sidebar |
| `core/testing` | `renderFeature`, MSW harness, axe assertions |
| `core/lib` | `cn`, clipboard, string helpers |

Core is where cross-cutting behaviour lives. A change here affects every tool,
so it is deliberately small and separate from the work contributors do.

## features/

Each directory under `features/` is a self-contained tool. The full
specification is in [FEATURE_CONTRACT.md](./FEATURE_CONTRACT.md).

## The generated registry

`scripts/generate-registry.mjs` scans `features/*/manifest.ts` and writes three
files into `core/registry/`:

| File | Used by |
| --- | --- |
| `manifests.generated.ts` | Navigation, dashboard, search, `generateStaticParams` |
| `panels.generated.ts` | The `/tools/[slug]` route, via `next/dynamic` |
| `registry.generated.ts` | Direct entry lookup |

All three are **gitignored** and regenerated automatically on `predev`,
`prebuild`, `pretest`, `prelint` and `postinstall`.

This is the central design decision. Because the registry is generated rather
than committed:

- adding a tool requires no edit to any shared file,
- dozens of feature branches can be open without conflicting,
- and navigation, routing and search stay in sync automatically.

Splitting manifests from panels also means listing 40 tools never pulls 40 tool
implementations into the bundle — a tool page loads only its own panel.

## Routing

One route serves every tool:

```
app/tools/[slug]/page.tsx
```

It resolves the slug against the registry, renders `FeatureShell` (heading,
character line, network badges) and mounts the slice's panel.
`generateStaticParams` prerenders every registered tool at build time.

## Data flow inside a slice

```
form input
   ↓  schema.ts          raw string → Result<Input, Code>
   ↓  hooks/use<Name>    state machine, network tagging, request identity
   ↓  lib/<domain>.ts    Horizon / RPC / local computation → Result<T, Code>
   ↓  lib/format.ts      values → display strings
   ↓  components/        idle | loading | success | error
```

Validation happens before any request. Transport failures are mapped to the
slice's own error codes by `lib/<domain>.errors.ts`, so a component never sees
a raw exception.

## Testing

`vitest` with jsdom, Testing Library, MSW and axe-core.

- `core/testing/render.tsx` — `renderFeature` wraps components in the real
  providers and returns a bound `userEvent`.
- `core/testing/msw.ts` — `withMswHandlers` installs a server with the standard
  lifecycle hooks. Unhandled requests fail the test.
- `core/testing/axe.ts` — `expectNoAxeViolations` fails with a readable report.

Requests are always mocked at the network boundary. `vi.mock` on an internal
module would test the mock instead of the code.

## Quality gates

```bash
npm run check    # registry → lint → test → verify:features → build
```

CI runs the same steps on every pull request, including
`npm run verify:features`, which fails a slice that does not meet the contract.
