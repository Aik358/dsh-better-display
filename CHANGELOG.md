# Changelog

## Unreleased

- Add a Better Display settings section: deliverables still open in the system app by default, with an optional right-Sidebar preview, plus generative-mcpapps skill-root detection and install guidance.
- Guard pending-submission image echoes so a text-only send cannot crash `conversation.view` (`images` / `attachments` may be missing).
- Install guidance names only conventional relative roots (`.dsh/skills`, `.agents/skills`) and never prints host home or plugin pack absolutes.
- Keep ChatView's `data-chat-flow=""` hook on the Reader column so skins that hide `[data-composer-seat]` when the scrollport has no chat-flow (maid-atelier, phoebe-atelier, and others) still show the composer in reading view.

## 0.1.1 — 2026-09-16

The accepted reading-view integration, including the work consolidated from PRs #2, #5 and #8. Earlier `0.2.0` / `0.2.1` headings were unpublished development notes; those changes ship in this release, not as separate published versions.

### Reading and folding

- A later reasoning step can fold earlier steps in its chain into a compact count summary. Body/tool updates alone do not trigger folding; user/steering input resets the chain. The auto-fold control can disable this presentation.
- Stable keyed rows shrink before counters update, pause briefly, then reveal buffered output. Preserve source order, selected text, reduced-motion behavior, and the visible final answer.
- Keep process statistics after turn completion. Empty hidden steps no longer accumulate 16px gaps in long completed turns.
- Give the auto-fold control a full-width, seamless lane without divider lines or replacement shadows. Statistics remain in normal flow until reaching the top, then stick below the measured status lane, whether expanded or collapsed.
- Short status labels remain readable instead of truncating. Waiting time resets to the latest user/steering submission rather than inheriting the turn's original start time.

### Navigation and native parity

- Keep the newer TimelineRail, including incremental history loading, per-turn metrics, fork support, and composer-safe landing. Scroll the conversation container rather than unrelated ancestor boxes.
- Skip host-synthetic `turn-process` JSON cards; render `/goal` command input as labeled text; give system-prompt details their own scrollport.
- Use the compact back-to-bottom chevron at the native near-bottom threshold and coalesce scroll-anchor capture.
- Show user-message time/copy controls and turn-end duration; defer produced-file rows until the turn closes.

### Interactive content

- Render generative MCP Apps from supported code fences, custom blocks, and tool results through an isolated iframe (`sandbox="allow-scripts allow-forms"`, no `allow-same-origin`).
- Support SEP-1865 JSON-RPC initialization, sizing, context updates, and prompt feedback into the composer, with light/dark synchronization and bounded auto-height.
- Include the generative-mcpapps skill pack, examples, and bilingual documentation.

### Distribution and verification

- Target DeepSeek Harness 0.1.5-rc.2 through public plugin/client extension points. No Agent, SDK, provider, credential, or Harness-core changes.
- Ship the stock-install bundle patch and rebuilt committed `lib/`, including declarations; git/tarball installation does not require `prepare`.
- Add fold-order/timing and steering-clock unit regressions, plus real-component browser fixtures for motion, 500 hidden rows, sticky/wrapped statistics, and waiting-clock resets.

## 0.1.0

First public release of the accepted reading-view plugin, published as `dsh-better-display`.

- Native context and tool details with source-ordered, unmodified reasoning.
- Bounded long-reasoning cards with two-line following, expanded follow and manual pause/resume.
- Successful-turn process folding with a separate final answer.
- Source-ordered text reveal and quiet busy-state shimmer.
- Stable status typography and compact disclosure spacing.
- Native content fallbacks and a trusted-plugin block extension slot.
- 42 regression tests; no changes to DSH Agent, SDK, providers or core.
