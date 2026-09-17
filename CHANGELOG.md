# Changelog

## Unreleased

### Compatibility and liveness

- A wait now restarts when a tool returns. The handover set named kinds from the
  conversation contract (`tool-result`) while the reader matches against the chat
  layer's kinds, where a returned tool is the `tool-call` row whose `data.root`
  carries a result. No node ever had the old name, so the branch was dead and a
  returned tool never restarted the clock. The set and every kind it reasons about
  are now typed against the host's own kind union, so a wrong name fails `tsc`
  instead of failing silently at runtime, and a tool that is still running is
  explicitly not a wait.
- The fold choreography can no longer stall. Each phase advances on animation
  promises and rendered frames, and a cancelled animation rejects while a hidden
  tab delivers no frames — either one used to leave the machine in a non-idle
  phase forever, which holds the frame source at the shown snapshot and pauses the
  text reveal, so the turn looked stuck until the view remounted. Every phase now
  also has a wall-clock deadline that forces the next phase.
- While the choreography holds the reveal, the stream buffer keeps absorbing the
  source instead of returning early, so text never resumes from a stale target
  once the fold settles.
- Status shows how many sub-agents the turn dispatched, read from the host's own
  turn-process row instead of being counted again here.
- Drop the `command-input` render branch: that string is not a chat node kind in
  any released host, so it only made the file look like it handled a case that
  cannot occur.

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
- Give the whole reading surface the same translucent treatment, so the skinned
  background shows through consistently: opaque black plates become a light
  wash with hairlines, and the detail chips (paths, counts, tool state) sit
  transparent until hovered or focused instead of carrying a filled plate each.
  This also keeps a row of chips reading as one line of text rather than a
  strip of buttons.
- The toolbar reserves the width of its whole control group. Measuring only the
  first button let the status lane paint over every later control.
- A compaction divider now arrives instead of simply appearing: the rule sweeps
  out from its centre, the pill settles in, and the dial turns once. Gated by
  `data-motion=off` and `prefers-reduced-motion` like every other transition.

### Diff review

- Read the changed line counts from the tool result the host already attaches
  (`meta.diffs`, `{ path, oldText, newText }`), and fall back to the call's own
  arguments for `write` / `edit` / `str_replace_editor` when a host build does
  not send them. The name whitelist matters: several unrelated tools take a
  field called `content`, and counting those invented additions for calls that
  changed no file.
- Fold a parent call's child calls into its own counts. A `run_code` that writes
  files reports what its children changed rather than what its own arguments
  contain, so a run whose edits live one level down no longer loses its counts.
  Each child contributes through its own arguments, read from either the landed
  result or the pending call.
- `+N -M` sits at the end of the row in green/red and opens a panel listing one
  entry per changed file — the file tabs, the removed lines on a red wash and
  the added lines on a green one, using the same `DiffBlock` primitive the
  official tool row renders. The panel is in flow, never a floating popup, so
  the flow cell's `overflow: clip` cannot cut it off.
- Opening and closing the panel animate real height in the plugin's own motion
  language, and the card is brought back into view when it opens below the
  fold; an open panel keeps its caret lit.

### Waiting and timing

- Show how long the model has been given the turn, next to 「深度求索中」and the
  in-flow wait indicator. The clock is anchored to the last event that handed
  control to the model — a returned tool, an injected context, a run command,
  the user's own message — never to the start of the turn, so a wait that has
  just begun does not inherit the minutes the tools already spent.
- Past ten seconds the readout adds a「暂未响应」badge, and the moment the model
  produces its first block the whole indicator is withdrawn. A tool that is
  still running is not a wait: the tool is the one working.
- A command that ran long keeps its duration after it returns (warning colour
  past ten seconds); a fast one shows nothing once it is done. Running steps
  show a live seconds readout and a shimmering summary while they work.

### Scroll

- Tail-follow only detaches on a real upward move by the reader. Content growth
  and the follow easing itself also move `scrollTop`, and reading that as "the
  user left the bottom" froze following mid-turn.
- Disable browser scroll anchoring on the conversation scroller while the reader
  is mounted: it moved the viewport on its own as the transcript grew.
- Only a focused text field suspends following, and only inside the reader.
  Focusing the composer used to stop the transcript from advancing.
- Stream at the source's own rate: add a feed-forward term estimated from the
  arrival rate on top of the proportional controller. A purely proportional
  reveal settles at a constant `catchUpMs` of lag regardless of model speed,
  which read as 「慢」 while the backlog grew with faster models; the feed-forward
  term drains the backlog and the proportional term absorbs transport jitter.
- Reveal a batch of words on one clock instead of one word per fixed gap.
  Per-word spacing pinned the rate near 16 words/second, so a fast model still
  arrived one word at a time; a batch now lands inside one short window while a
  lone new word keeps the original typing cadence.
- The reasoning pane's own follow steps with the backlog rather than at a fixed
  step-and-hold: it used to advance two lines every ~1.3 seconds no matter how
  fast the text arrived, which is what made the pane look like it was lagging
  behind a fast model.
### Host DOM hooks

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
