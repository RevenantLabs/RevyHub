# Horizon Pagination Response Inspector

Decode and inspect Horizon paginated response links, cursors, and record sets.

## What it does

- **Parse JSON responses**: Extract cursors, record counts, and links from Horizon JSON
- **Parse URLs**: Extract cursor and limit parameters from Horizon URLs
- **Parse Link headers**: Decode RFC 5988 Link headers with rel="next"/"prev"
- **Build paginated URLs**: Construct URLs with cursor and limit parameters

## Design decisions

- **Fully offline**: No network requests. All parsing is done locally.
- **Multi-format input**: Accepts JSON, URLs, or Link headers.
- **Auto-detection**: Automatically detects input format based on content.

## Error handling

- Empty input → specific error
- Invalid JSON → parse error
- Malformed URL → parse error
