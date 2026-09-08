# Samuel Computer Agent — Architecture

## Goal

Turn Samuel from a chat/voice interface into a supervised computer operator that can plan, execute, verify, and report work across browsers, connected apps, files, and (later) desktop applications.

## Core principle

Samuel must never claim a side effect completed unless it is verified. Existing `SamuelActionEngine` remains the policy and evidence gate. Computer control is an execution surface, not a replacement for the orchestrator.

## Product architecture

### 1. Samuel Cloud Brain (existing SF Growth AI)

Responsibilities:
- understand intent;
- load company/user context;
- plan multi-step tasks;
- select the best execution surface;
- classify risk (`read`, `draft`, `mutate`, `sensitive`);
- request confirmation for external side effects;
- issue idempotent action requests;
- verify results;
- keep an execution/audit timeline.

### 2. Direct connectors first

For Gmail, Calendar, CRM, social APIs, databases, Drive, GitHub and other supported services, prefer deterministic APIs/connectors over GUI clicking. They are faster, more reliable and easier to verify.

### 3. Samuel Browser Agent

Use browser automation when no reliable connector exists or the requested action is inherently web UI based.

Capabilities:
- open/navigate pages;
- inspect DOM/accessibility tree;
- click/type/select/scroll;
- manage tabs;
- upload/download files;
- take screenshots;
- preserve authenticated browser profiles;
- wait for user login/2FA when required;
- return evidence after mutations.

Recommended implementation: Playwright/browser-use style execution behind a narrow tool contract.

### 4. Samuel Desktop Agent

A signed local companion application is required for control of the user's actual computer.

Responsibilities:
- maintain an outbound authenticated session to Samuel Cloud;
- expose explicitly granted local capabilities;
- launch/control supported browsers;
- read/write explicitly approved files/folders;
- later expose OS accessibility actions for desktop apps;
- stream screenshots/state only while a task is active;
- pause immediately on user takeover;
- enforce a local allow/deny policy even if cloud requests otherwise.

A pure Vercel web app cannot provide this OS-level control.

## Execution surface priority

1. Native connector/API.
2. Site tool/MCP/WebMCP when available.
3. Structured browser automation (DOM/accessibility tree).
4. Vision + mouse/keyboard computer use.
5. Ask the user to take over for unsupported login, CAPTCHA, biometric, or blocked high-risk steps.

## Universal task lifecycle

`idle -> listening -> understanding -> planning -> awaiting_confirmation -> executing -> verifying -> responding`

For read-only actions, `awaiting_confirmation` may be skipped.

For mutation/sensitive actions, confirmation is mandatory unless a narrowly-scoped user policy explicitly pre-authorizes that exact class of action.

## Tool contracts

### Browser

- `browser.open(url)`
- `browser.snapshot()`
- `browser.click(target)`
- `browser.type(target, text)`
- `browser.select(target, value)`
- `browser.scroll(direction, amount)`
- `browser.tabs.list()`
- `browser.tabs.switch(id)`
- `browser.upload(target, fileRef)`
- `browser.download(target)`
- `browser.screenshot()`
- `browser.verify(assertion)`

### Desktop

Initial safe subset:
- `desktop.apps.list()`
- `desktop.apps.open(appId)`
- `desktop.window.list()`
- `desktop.window.focus(windowId)`
- `desktop.screenshot(windowId?)`
- `desktop.files.read(scopedPath)`
- `desktop.files.write(scopedPath, content)`

Later, behind OS Accessibility permission:
- `desktop.pointer.click(x,y)`
- `desktop.keyboard.type(text)`
- `desktop.keyboard.shortcut(keys)`

### Communications

Prefer connectors over GUI:
- Gmail/message read/search/draft/send/reply;
- Calendar read/create/update/delete;
- CRM lead/contact/deal/task actions;
- social post draft/publish where official API exists.

If no connector exists, fall back to Browser Agent.

## Risk policy

### Read
Can execute automatically when scope is already authorized.
Examples: read inbox, inspect CRM, open a webpage, check analytics.

### Draft
Can prepare without publishing/sending.
Examples: draft email, compose social post, prepare proposal.

### Mutate
Requires explicit confirmation unless covered by a user-defined scoped automation policy.
Examples: edit CRM, upload a file, change a campaign, publish a post.

### Sensitive
Always requires fresh confirmation at execution time.
Examples: send messages, delete content, purchases/payments, account/security changes, destructive file operations.

## Confirmation invariant

Confirmation must be bound to:
- authenticated user;
- company/tenant;
- exact normalized action arguments;
- idempotency key;
- expiration time.

Changing arguments invalidates approval.

## Verification evidence

Examples:
- connector provider acknowledgement + object ID;
- browser URL + visible success state + DOM assertion;
- screenshot hash/reference;
- resulting message/post ID;
- CRM entity ID and after-state;
- file checksum/path after write.

No evidence => `executed_unverified`, and Samuel must not say the action is finished.

## Desktop security

The local agent must:
- pair with the user's account using a one-time code;
- store device credentials in OS secure storage;
- use outbound-only encrypted connections;
- expose no unauthenticated LAN port;
- have a global Pause/Stop button;
- show a visible indicator while screen/browser control is active;
- keep an append-only local execution log;
- allow per-capability revocation;
- default to deny for unknown commands;
- never transmit stored passwords as model-visible text.

## Voice

Voice is only the input/output channel. It must feed the same orchestrator as text.

Required flow:
1. microphone starts;
2. speech is transcribed/streamed;
3. transcript becomes the user turn;
4. orchestrator plans/tools execute;
5. verified result streams back;
6. Samuel speaks the answer;
7. interruption (barge-in) stops speech immediately and opens a new user turn.

## Milestones

### M1 — Reliable voice + direct tools
- fix realtime voice transport;
- Gmail/Calendar through Action Engine;
- CRM/task tools;
- unified activity timeline.

### M2 — Browser Agent
- Playwright/browser-use style worker;
- persistent browser profile;
- live browser view;
- screenshots + DOM evidence;
- confirmation before external side effects.

### M3 — Desktop Agent
- signed Windows/macOS companion;
- account pairing;
- browser control on the user's device;
- scoped files/app launching;
- local stop/pause control.

### M4 — Computer Use
- accessibility/vision fallback;
- mouse/keyboard control for unsupported desktop apps;
- user takeover;
- granular permission policies.

### M5 — Proactive automations
- recurring tasks;
- event-driven inbox/CRM monitoring;
- supervised autonomous outreach;
- posting/scheduling workflows;
- observability for cost, latency, failures, retries and business impact.

## Definition of 'Jarvis-like' for SF Growth AI

Samuel is not a voice skin. Samuel is the orchestrator that can choose the right tool, execute through APIs/browser/desktop, verify the outcome, remember business context, and continue the conversation with a natural voice while respecting explicit permission boundaries.
