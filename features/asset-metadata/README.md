# Asset Metadata Discovery

Reads a domain's `stellar.toml` and reports the assets it declares under
[SEP-0001](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md).

## How it works

The input is normalised to a bare HTTPS origin and the well-known path is
appended by the tool itself. Any path, query or fragment the user typed is
discarded, so a pasted URL cannot steer the request at an arbitrary endpoint on
the host. Bare IP addresses and URLs carrying credentials are refused.

`[[CURRENCIES]]` is read by a small purpose-built parser rather than a full
TOML library, because stellar.toml uses a narrow, well-defined subset. The
parser stops at the next table header so a currency block never absorbs keys
from a sibling table — there is a test asserting that `[DOCUMENTATION]` values
do not leak into a currency.

## What this tool refuses to do

- **Follow redirects.** SEP-0001 metadata only means something when it comes
  from the domain that was asked about. A redirect moves the request to a host
  the user never named, so it is reported rather than chased.
- **Fetch anything the toml points at.** `image` and `home_domain` are rendered
  as text. Following a URL supplied by the file being inspected would make the
  tool an open redirector on behalf of an untrusted document.
- **Present the metadata as verified.** Every result carries a standing notice
  that this is what the domain claims about itself. The issuer writes this
  file; it is a self-description, not a fact.

## Size and timeouts

A stellar.toml is a few kilobytes. Anything over 100 KiB is refused, checked
both from the `content-length` header and from the actual decoded body — a
server can under-report or omit the header.

Requests time out after ten seconds. A browser cannot distinguish "host does
not exist" from "host refused CORS" — both arrive as the same opaque
`TypeError` — so they share one error code and the copy says so instead of
guessing.

## Not an error

A valid toml that declares no assets is a **successful** result with an empty
list, not a failure. The distinction matters: it is the difference between "this
domain publishes no assets" and "this domain is unreachable".
