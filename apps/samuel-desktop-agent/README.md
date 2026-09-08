# Samuel Desktop Agent

Local execution companion for SF Growth AI.

This package will provide the device-side execution surface required for Samuel to operate the user's real browser and, with explicit OS permission, selected desktop applications and files.

## Why this exists

The SF Growth AI web app runs in the cloud and cannot directly control a user's Windows/macOS session. The Desktop Agent creates a secure, outbound-only bridge between the Samuel orchestrator and explicitly granted local capabilities.

## Initial capability set

1. Browser automation using a dedicated Chromium/Playwright profile.
2. Browser snapshots and screenshots for verification.
3. File read/write within user-approved folders.
4. Application launch/window inventory.
5. Local pause/stop control.

OS-level pointer/keyboard automation is intentionally a later layer and must be permission-gated.

## Security invariants

- No unauthenticated inbound control port.
- Pair device to a user account with a short-lived one-time code.
- Keep device secret in OS keychain/credential vault.
- Verify every cloud command signature and expiry.
- Reject unknown tool names and unknown arguments.
- Mutating/sensitive commands must contain a valid Samuel Action Engine approval reference.
- Keep a local immutable execution timeline.
- User can stop execution immediately.
- Credentials typed into websites must not be returned to the model or cloud logs.

## Execution preference

Direct connectors remain preferred for Gmail, Calendar, CRM, social APIs and other structured services. Browser/desktop automation is the fallback for workflows that cannot be completed reliably via API.

See `docs/samuel-computer-agent-architecture.md` for the full design.
