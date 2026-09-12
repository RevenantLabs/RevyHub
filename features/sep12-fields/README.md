# SEP-12 KYC Field Reference

A searchable, offline reference of the SEP-9 field names and types that SEP-12
anchors ask for, grouped into natural person, organization and financial
account, with every canonical name copyable.

Nothing is transmitted. The field table is compiled into the bundle.

## The failure this tool prevents

Anchors match KYC fields on the exact SEP-9 name. A near miss is not a
validation error you can read — it is a field the anchor silently ignores, and
the symptom shows up much later as a customer that never verifies. So the
canonical name is the primary thing this tool shows, and it is copyable rather
than merely displayed.

Search ranks a canonical-name match above a description match for the same
reason. A query like "address" hits both address and address_country_code by
name, and would otherwise be drowned by every field that merely mentions an
address in prose. Name matches come first, then prose matches, each
alphabetically.

## What this tool deliberately does not say

**It does not mark fields as required.** SEP-9 defines names and types; it does
not decide what an anchor will ask a given customer for. That comes from the
anchor's own customer request and differs between anchors, and for the same
account over time. A required/optional column here would be inventing a
standard that does not exist, so the panel says this in words instead, and a
test pins the explanation rather than letting it quietly disappear.

**It is a curated subset, not the whole standard.** SEP-9 is the authority.
The table covers the fields integrations reach for most; if an entry misstates
the standard, SEP-9 wins and the entry should be corrected.

## Both spellings, derived rather than stored

Standard names are snake_case; integrations frequently camelCase them. The
camelCase spelling is derived from the canonical name by toCamelCase rather
than stored next to it. Two hand-maintained lists drift apart; one derived list
cannot. Organization names keep their prefix verbatim, because
organization.VAT_number is a single name rather than a namespace wrapping a
local one.

## Why the schema keeps underscores and dots

Lowercasing and trimming are the entire transformation. Underscores and dots
are load-bearing: stripping them would make address_country_code and
addresscountrycode identical at the exact point where telling them apart is the
tool's only job. A test pins that.

An empty query is not an error — it means "show me everything", which is a real
thing to want from a reference.

## Error states, honestly

There is one error code, not a family of them. Searching a local table cannot
fail the way a request can, and this slice parses no external document. The one
realistic input mistake — a document pasted into the search box — is caught by
a 200-character bound with copy that says what to do instead.

There is no loading state for the same reason: searching is synchronous over a
table already in the bundle, so one would only be a fake delay in front of a
filter.

## Files

| Path | Responsibility |
| --- | --- |
| manifest.ts | Registry metadata — offline, networks: [] |
| types.ts | Types and the single error code |
| schema.ts | Query normalisation and the length bound |
| lib/sep12Fields.ts | The curated table and the search |
| lib/sep12Fields.errors.ts | The (empty) transport-failure classification |
| lib/format.ts | Group, type and camelCase derivation |
| hooks/useSep12Fields.ts | idle / success / error |
| components/ | Form, result, empty state, panel |
| __tests__/ | Logic, schema, formatting, hook, component, axe |
| fixtures/ | A fixed field set so search tests do not track the catalogue |
| msw/ | No handlers — this slice makes no request |

## Safety

This tool never asks for, displays, stores or transmits a secret key, and it
never signs or submits a transaction. It is a reference: the input is a search
term, and the output is a description of a standard.
