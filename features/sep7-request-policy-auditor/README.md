# SEP-0007 Request Policy Auditor

The URI is parsed as text. `+` is preserved, so it is not treated as a space.
Only `pay` is accepted. `tx` and any other operation stop before policy
evaluation. Signature query parameters are ignored; this tool does not verify
a URI signature and does not claim the request is authentic.

A successful parse and an accepted policy are separate. Destination, amount,
passphrase, asset, memo and callback each get their own verdict. Amounts are
converted to stroops with `BigInt` after padding the fraction to 7 digits.
Callback values that start with `url:` are read only to compare the host with
the allowlist. The URL is never fetched or opened.

Secret seeds are cleared in the form and are not copied into the verdict JSON.
The tool is offline: `networks` is empty and the MSW handler list is empty.

Run `npm run verify:features -- sep7-request-policy-auditor`.
