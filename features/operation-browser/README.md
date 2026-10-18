# Operation History Browser

Browse every operation an account has submitted or received, newest first, using
Horizon's account operations collection. Filter by operation type and page
through older history without infinite scroll.

## How it works

The tool validates a public `G…` account address, then calls:

`GET /accounts/{account_id}/operations?order=desc&limit=20`

Each page is cached locally. **Load more** fetches the next older page using the
last row's `paging_token` as the Horizon cursor. **Show newer** walks back to a
previously loaded page without another request. The type filter applies to every
loaded row and reports how many match.

Operation parameters are rendered per type — payments show amount and
destination, trustline changes show asset and limit, offers show price, and so
on. Unknown protocol types degrade to a readable field list instead of raw JSON.

Failed operations inherit a red tint and badge from `transaction_successful:
false`, while the transaction hash stays copyable for follow-up in the
transaction lookup tool.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Account validation (`G…` public key, secret seed rejected) |
| `lib/operationBrowser.ts` | Horizon fetch, normalisation and paging |
| `lib/format.ts` | Operation labels, timestamps and per-type parameters |
| `hooks/` | React state machine with network-tagged results |
| `components/` | Form, result list, empty and error UI |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic accounts and operation pages |
| `msw/` | Request mocks |

## Safety

This tool only accepts a public account address. Values starting with `S` are
rejected on prefix alone and are never displayed, stored, or sent to Horizon.
