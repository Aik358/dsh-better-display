# Changelog

## Unreleased

### Reading and folding

- A later reasoning step folds only the finished process run it follows. The run
  that is still streaming stays fully expanded, so a long turn reads as
  alternating digests and prose instead of collapsing mid-thought.
- Add a process-only fold mode (`只折叠过程`). Prose is never folded; each
  finished run of reasoning / tool / record steps collapses into one digest that
  names what the tools actually did (`读取 Reader.tsx`, `运行 pnpm test`,
  `搜索 processSummary`), read from the same tool identity the tool cards use.
  Off by default, so the existing auto-fold behaviour is unchanged.
- A finished process-only turn folds its trailing run too, and skips the
  duplicate closed-turn counter row it no longer needs.

### Reading surface

- Sticky lanes (toolbar, status, fold summary, live fold) use the same liquid
  glass as the dsh-auto-memory pane: translucent `bg-layer-2` wash, `blur(28px)`,
  hairline border, 16px radius and a soft lift, instead of an opaque band that
  covered the transcript.
- The toolbar reserves the width of its whole control group. Measuring only the
  first button let the status lane paint over every later control.

### Scroll

- Tail-follow only detaches on a real upward move by the reader. Content growth
  and the follow easing itself also move `scrollTop`, and reading that as "the
  user left the bottom" froze following mid-turn.
- Disable browser scroll anchoring on the conversation scroller while the reader
  is mounted: it moved the viewport on its own as the transcript grew.
- Only a focused text field suspends following, and only inside the reader.
  Focusing the composer used to stop the transcript from advancing.
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
