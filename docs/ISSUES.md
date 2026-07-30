# GitHub Issue Roadmap

## Contributor Expectations For Every Issue

Each issue is intentionally scoped beyond a small visual tweak. A contributor should:

- Find the matching `TODO(issue #x)` comment in the codebase before starting.
- Update the relevant UI, Stellar utility, documentation, or tests as described.
- Handle empty, loading, success, and error states when the issue touches a user flow.
- Keep the anthropomorphic theme consistent across copy, layout, and component behavior.
- Run `npm run lint` and `npm run build` before opening a pull request.
- Add or update documentation when the behavior changes.

## Issue 1

### Title

[Frontend] Improve dashboard tool grid and landing section

### Type

Frontend / UI

### Difficulty

Intermediate

### Description

Improve the homepage dashboard with a polished hero section, clear tool cards, status badges, and responsive layout.

### Acceptance Criteria

- Dashboard clearly explains the project
- Tool cards link to correct routes
- Mobile layout works properly
- Status badges are visible
- UI is consistent with the dark theme

## Issue 2

### Title

[Stellar] Improve address validator with better error messages

### Type

Stellar SDK / Frontend

### Difficulty

Intermediate

### Description

Enhance the address validator tool by adding more helpful validation messages and educational hints.

### Acceptance Criteria

- Valid addresses show a clear success state
- Invalid addresses explain what is wrong
- Empty input state is handled
- User sees an explanation of Stellar public keys
- No app crash occurs

## Issue 3

### Title

[Stellar] Add mainnet/testnet network switch

### Type

Stellar SDK / UI

### Difficulty

Advanced

### Description

Add a global network switch that allows users to choose between Stellar testnet and mainnet.

### Maintainer Status

Completed with a persisted app-level network switch that drives Balance Viewer, Trustline Checker, and Transaction Lookup. Friendbot remains testnet-only by design.

### Acceptance Criteria

- User can select testnet or mainnet
- Balance viewer uses selected network
- Transaction lookup uses selected network
- UI clearly shows active network
- Testnet-only tools show proper warning

## Issue 4

### Title

[Stellar] Improve balance viewer asset display

### Type

Stellar SDK / Frontend

### Difficulty

Intermediate

### Description

Improve the wallet balance viewer by displaying native XLM and issued assets more clearly.

### Acceptance Criteria

- Native XLM is clearly labeled
- Issued assets show asset code
- Issuer address is shown or truncated
- Long values do not break layout
- Empty balances are handled

## Issue 5

### Title

[Stellar] Add USDC trustline preset

### Type

Stellar SDK / UX

### Difficulty

Advanced

### Description

Add a preset option for checking Stellar USDC trustlines without manually entering asset code and issuer.

### Acceptance Criteria

- User can select USDC from a preset dropdown
- Asset code and issuer auto-fill
- Trustline checker works with preset
- Documentation explains testnet/mainnet difference
- Error states remain clear

## Issue 6

### Title

[Frontend] Build reusable StatusMessage component

### Type

Frontend / Component

### Difficulty

Intermediate

### Description

Create a reusable component for success, error, warning, and info messages across all tools.

### Acceptance Criteria

- Component supports four states
- Used in at least three tool pages
- Looks consistent with project theme
- Accepts title and description props
- Accessible color contrast is considered

## Issue 7

### Title

[Wallet] Improve Freighter wallet detection

### Type

Wallet Integration

### Difficulty

Advanced

### Description

Improve the Freighter Connect page by detecting wallet availability, connection state, and user rejection.

### Maintainer Status

Completed for extension availability, allowed/connected state, public-key display, and rejection handling.

### Acceptance Criteria

- App detects if Freighter is installed
- Connect button works when available
- User rejection is handled gracefully
- Connected public key is displayed
- Not installed state includes helpful guidance

## Issue 8

### Title

[Wallet] Add Freighter network display

### Type

Wallet Integration

### Difficulty

Advanced

### Description

Display the active Freighter network and warn users when it does not match the selected app network.

### Maintainer Status

Completed with wallet network display using human-readable labels, app-vs-wallet mismatch warning with Badge indicator, actionable guidance on which network to switch Freighter to, and a future TODO for a network change listener.

### Acceptance Criteria

- Active wallet network is shown
- Warning appears if mismatch exists
- Works without crashing if Freighter is unavailable
- Documentation explains expected behavior
- UI remains clean

## Issue 9

### Title

[Stellar] Improve transaction lookup details

### Type

Stellar SDK

### Difficulty

Advanced

### Description

Enhance the transaction lookup page to show more useful transaction information.

### Acceptance Criteria

- Transaction status is displayed
- Ledger number is displayed
- Fee charged is displayed
- Source account is displayed
- Operation count is displayed
- Explorer link is provided

## Issue 10

### Title

[Stellar] Add operation list to transaction lookup

### Type

Stellar SDK

### Difficulty

Advanced

### Description

Fetch and display the operations included in a Stellar transaction.

### Acceptance Criteria

- Operations are fetched from Horizon
- Operation type is displayed
- Important operation fields are shown
- Empty operation state is handled
- Errors are handled properly

## Issue 11

### Title

[QR] Improve payment QR generator validation

### Type

Frontend / Stellar UX

### Difficulty

Advanced

### Description

Improve form validation for the payment QR generator.

### Maintainer Status

Completed with a reusable `validatePaymentForm` function and real-time field-level validation on the payment QR page. Submit button is disabled when any field is invalid.

### Acceptance Criteria

- Destination address is validated
- Amount must be positive
- Memo length is validated
- Asset selection is required
- User cannot generate invalid QR data

## Issue 12

### Title

[QR] Add Stellar payment URI format support

### Type

Stellar / QR

### Difficulty

Advanced

### Description

Implement a more standardized Stellar payment URI structure for generated QR codes.

### Acceptance Criteria

- QR content follows a clear payment URI format
- Destination, amount, asset, and memo are included
- Generated URI is visible to user
- Copy button works
- README documents the format used

## Issue 13

### Title

[Testnet] Improve Friendbot funding helper

### Type

Stellar Testnet

### Difficulty

Advanced

### Description

Improve the testnet faucet helper with better loading, error, and success states.

### Acceptance Criteria

- Invalid address is rejected before request
- Loading state appears during request
- Success state shows funded account
- Error state explains failure
- Testnet-only warning is visible

## Issue 14

### Title

[Docs] Add Stellar basics explanation page

### Type

Documentation / Education

### Difficulty

Intermediate

### Description

Add a simple documentation page explaining Stellar public keys, assets, trustlines, Horizon, and testnet.

### Maintainer Status

Completed in `docs/STELLAR_BASICS.md`.

### Acceptance Criteria

- New docs page exists
- Stellar public keys are explained
- Trustlines are explained
- Horizon is explained
- Testnet vs mainnet is explained

## Issue 15

### Title

[UI] Add responsive sidebar navigation

### Type

Frontend / UI

### Difficulty

Advanced

### Description

Improve navigation so the app works well on mobile and desktop.

### Acceptance Criteria

- Desktop sidebar works
- Mobile menu works
- Active route is highlighted
- Navigation links are accessible
- Layout does not overflow on small screens

## Issue 16

### Title

[Testing] Add unit tests for address validation

### Type

Testing

### Difficulty

Intermediate

### Description

Add unit tests for the Stellar address validation utility.

### Maintainer Status

Completed in the maintainer-led test coverage pass. Future contributions can expand edge-case coverage.

### Acceptance Criteria

- Valid public key test exists
- Invalid public key test exists
- Empty input test exists
- Tests can run with npm script
- README explains how to run tests

## Issue 17

### Title

[Testing] Add tests for payment QR form validation

### Type

Testing

### Difficulty

Advanced

### Description

Add tests for payment QR generator validation logic.

### Maintainer Status

Completed for destination, amount, memo, native XLM, and issued asset validation. Future contributions can add component-level form tests.

### Acceptance Criteria

- Invalid destination test exists
- Invalid amount test exists
- Valid form test exists
- Memo validation test exists
- Tests pass locally

## Issue 18

### Title

[DX] Add GitHub issue templates

### Type

Developer Experience

### Difficulty

Intermediate

### Description

Add GitHub issue templates for feature requests, bug reports, and documentation improvements.

### Maintainer Status

Completed with bug report, feature request, and documentation templates.

### Acceptance Criteria

- Bug report template exists
- Feature request template exists
- Documentation template exists
- Templates are easy to fill
- CONTRIBUTING.md links to templates

## Issue 19

### Title

[DX] Add pull request template

### Type

Developer Experience

### Difficulty

Intermediate

### Description

Add a pull request template that helps contributors describe their changes clearly.

### Maintainer Status

Completed with summary, type, validation, screenshots, and notes sections.

### Acceptance Criteria

- PR template exists
- Includes summary section
- Includes testing section
- Includes screenshots section
- Includes checklist

## Issue 20

### Title

[Docs] Add Vercel deployment guide

### Type

Documentation

### Difficulty

Intermediate

### Description

Add a step-by-step guide for deploying RevyHubX to Vercel.

### Maintainer Status

Completed in `docs/DEPLOYMENT.md`.

### Acceptance Criteria

- Vercel deployment steps are documented
- Environment variables are explained
- Build command is included
- Common deployment errors are listed
- README links to deployment guide

## Issue 21

### Title

[Stellar] Add account not found educational state

### Type

UX / Stellar

### Difficulty

Advanced

### Description

When a Stellar account is not found, explain why it may not exist and how testnet accounts can be funded.

### Acceptance Criteria

- Account not found state is friendly
- User sees explanation
- Link to Testnet Faucet Helper exists
- No raw technical error is shown
- Works in Balance Viewer and Trustline Checker

## Issue 22

### Title

[Frontend] Add copy-to-clipboard utility

### Type

Frontend

### Difficulty

Intermediate

### Description

Create a reusable copy-to-clipboard utility and use it across address, transaction, and QR pages.

### Acceptance Criteria

- Utility function exists
- Copy button gives feedback
- Used in at least two pages
- Handles browser permission errors
- Works on mobile

## Issue 23

### Title

[Stellar] Add asset issuer display helper

### Type

Stellar SDK / Frontend

### Difficulty

Intermediate

### Description

Create a helper component for displaying long Stellar issuer addresses in a readable way.

### Acceptance Criteria

- Long issuer addresses are truncated
- Full value is accessible via copy button
- Used in Balance Viewer
- Used in Trustline Checker
- Mobile layout is not broken

## Issue 24

### Title

[UI] Add loading skeletons for async tools

### Type

Frontend / UX

### Difficulty

Intermediate

### Description

Add loading skeletons or clean loading states for tools that call Horizon or Friendbot.

### Acceptance Criteria

- Balance Viewer has loading state
- Transaction Lookup has loading state
- Testnet Faucet has loading state
- Loading UI matches theme
- No layout jump feels broken

## Issue 25

### Title

[Docs] Add contributor-friendly architecture overview

### Type

Documentation

### Difficulty

Intermediate

### Description

Create a documentation page explaining the project architecture and where contributors should add new features.

### Maintainer Status

Completed in `docs/ARCHITECTURE.md`. Future contributions can add diagrams or per-tool extension examples.

### Acceptance Criteria

- Architecture overview exists
- Folder structure is explained
- Tool page pattern is explained
- Stellar utility files are explained
- New contributors can understand where to start
