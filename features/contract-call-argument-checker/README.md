# Contract Call Argument Checker

Spec entries and argument values are decoded from canonical base64 XDR in the
browser. Each line is one `ScSpecEntry` or one `ScVal`. The decoded shapes are
compared structurally: option none is `void`, named structs are symbol-keyed
maps, and vectors are checked element by element. A mismatch path looks like
`argument 2 > field owner`.

This does not simulate or submit a call, and it does not prove the invocation
will succeed. Result types are rejected as unsupported. Inputs longer than
80000 characters are refused before any user-controlled bytes are rendered.
Secret seeds are cleared in the form and never copied into the result. Reset
discards the in-memory paste.

The tool is offline: `networks` is empty and the MSW handler list is empty.

Run `npm run verify:features -- contract-call-argument-checker`.
