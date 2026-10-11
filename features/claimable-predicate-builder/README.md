# Claimable Balance Predicate Builder

Build a Stellar claimable-balance predicate from a JSON tree, preview it in plain English, and export the XDR.

## Predicate JSON format

```json
{ "type": "unconditional" }
{ "type": "abs_before", "timestamp": 1893456000000 }
{ "type": "abs_after", "timestamp": 1893456000000 }
{ "type": "rel_before", "seconds": 86400 }
{ "type": "rel_after", "seconds": 86400 }
{ "type": "not", "child": { "type": "unconditional" } }
{
  "type": "and",
  "children": [
    { "type": "rel_after", "seconds": 3600 },
    { "type": "abs_before", "timestamp": 1893456000000 }
  ]
}
```

- `timestamp` values are Unix milliseconds.
- `seconds` values are non-negative integers.
- `and` and `or` require exactly two children.
- Nesting deeper than 5 levels is rejected.

## Output

For a valid predicate the tool returns:

- A plain-language description (e.g. "within 1 day after the balance was created").
- The base64-encoded XDR of the `ClaimPredicate`.
- A claimability timeline relative to the balance creation time.
- A flag indicating whether the predicate is unsatisfiable.

## Constraints

- Pure offline tool: no network requests, no secret keys.
- All expected failures return a typed `Result` with an error code, never an exception.
- All user-facing copy lives in `copy.ts`.
