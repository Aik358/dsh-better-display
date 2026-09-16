import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { ReaderProps } from './types.js';
import type { LiveStep, LiveTurnItem } from './live-turn.js';
import { collapseRows, containsNewUser, flowRows, FOLD_TIMING, retiringKeys } from './fold-choreography.js';
import type { FoldPhase } from './fold-choreography.js';
import { Disclosure } from './motion.js';
import { FoldSummaryText } from './LiveFold.js';
import { StreamMotionContext } from './streaming.js';
import css from './Reader.module.css';

const FlowSnapshot = createContext<ChatSnapshot | null>(null);
/** Public projection only. Descendants cannot leak live data through a frozen frame. */
export const useFlowChat: ReaderProps['useChat'] = selector => {
  const snapshot = useContext(FlowSnapshot);
  if (!snapshot) throw new Error('Flow snapshot provider missing');
  return selector(snapshot);
};

export type PresentationFrame = { items: readonly LiveTurnItem[]; snapshot: ChatSnapshot };
type Transaction = {
  phase: FoldPhase; shown: PresentationFrame; target: PresentationFrame;
  retiring: readonly string[]; beforeKeys: ReadonlySet<string>;
};
const idle = (frame: PresentationFrame): Transaction => ({ phase: 'idle', shown: frame, target: frame, retiring: [], beforeKeys: new Set() });

function Summary({ item, open, onChange, motion }: {
  item: Extract<LiveTurnItem, { kind: 'fold' }>; open: boolean; onChange: (open: boolean) => void; motion: boolean;
}) {
  const button = useRef<HTMLButtonElement>(null);
  return <div data-reader-live-fold data-expanded={open} data-reader-live-fold-summary={item.summary}>
    <Disclosure open={open} onChange={onChange} buttonRef={button} ariaLabel="此前步骤"
      label={<FoldSummaryText summary={item.summary} motion={motion} />} />
  </div>;
}

/** Manual disclosure shares the measured-size path; children survive until finish. */
function FlowCell({ hidden, instant, motion, rowKey, children, summary = false }: {
  hidden: boolean; instant: boolean; motion: boolean; rowKey: string; children: ReactNode; summary?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(!hidden);
  const previous = useRef(hidden);
  if (!hidden && !present) setPresent(true);
  useLayoutEffect(() => {
    const el = ref.current;
    const changed = previous.current !== hidden;
    previous.current = hidden;
    if (!el) return;
    if (!changed || instant || !motion) { setPresent(!hidden); return; }
    const height = el.scrollHeight;
    const animation = el.animate([
      { height: `${hidden ? height : 0}px`, opacity: hidden ? 1 : 0 },
      { height: `${hidden ? 0 : height}px`, opacity: hidden ? 0 : 1 },
    ], { duration: 220, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
    el.dispatchEvent(new CustomEvent('reader-layout-start', { bubbles: true }));
    let released = false;
    const release = () => { if (!released) { released = true; el.dispatchEvent(new CustomEvent('reader-layout-end', { bubbles: true })); } };
    animation.onfinish = () => { setPresent(!hidden); animation.cancel(); release(); };
    return () => { animation.cancel(); release(); };
  }, [hidden, instant, motion]);
  return <div ref={ref} className={css.flowCell} data-flow-key={rowKey} data-flow-summary={summary || undefined}
    hidden={hidden && !present} aria-hidden={hidden || undefined} {...(hidden ? { inert: '' } : {})}>
    {present && <div className={css.flowCellInner}>{children}</div>}
  </div>;
}

export function ChoreographedFlow({ frame, motion, enabled, urgent, open, onOpenChange, processOpen, renderStep, id }: {
  frame: PresentationFrame; motion: boolean; enabled: boolean; urgent: boolean;
  open: Readonly<Record<string, boolean>>; onOpenChange: (key: string, value: boolean) => void;
  processOpen: boolean; renderStep: (step: LiveStep, folded: boolean) => ReactNode; id: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const stream = useContext(StreamMotionContext);
  const latest = useRef(frame); latest.current = frame;
  const [visible, setVisible] = useState(() => !document.hidden);
  const [state, setState] = useState<Transaction>(() => idle(frame));
  const bypass = !motion || !enabled || urgent || !visible || !processOpen || (state.phase !== 'idle' && Object.values(open).some(Boolean));
  // Render-time adjustment prevents even one paint of the new authoritative layout.
  if ((bypass || containsNewUser(state.shown.items, frame.items)) && (state.phase !== 'idle' || state.shown !== frame)) {
    setState(idle(frame));
  } else if (state.phase === 'idle' && state.shown !== frame) {
    const retiring = retiringKeys(state.shown.items, frame.items, open);
    setState(retiring.length ? { ...state, phase: 'collapse', target: frame, retiring,
      beforeKeys: new Set(flowRows(state.shown.items).map(row => row.key)) } : idle(frame));
  }
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useLayoutEffect(() => {
    if (state.phase !== 'collapse') return;
    const el = root.current;
    if (!el) return;
    const retiring = new Set(state.retiring);
    const animations: Animation[] = [];
    el.dispatchEvent(new CustomEvent('reader-layout-start', { bubbles: true }));
    for (const cell of el.querySelectorAll<HTMLElement>(':scope > [data-flow-key]')) {
      const key = cell.dataset.flowKey!;
      const isHeader = cell.dataset.flowSummary && !state.beforeKeys.has(key);
      if (!retiring.has(key) && !isHeader) continue;
      const height = cell.getBoundingClientRect().height;
      animations.push(cell.animate(isHeader ? [
        { height: '0px', opacity: 0 }, { height: `${height}px`, opacity: 1 },
      ] : [
        { height: `${height}px`, opacity: 1 },
        { height: `${height * .5}px`, opacity: .85, offset: .5 },
        { height: '0px', opacity: 0 },
      ], { duration: FOLD_TIMING.collapse, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' }));
    }
    let cancelled = false;
    Promise.all(animations.map(animation => animation.finished)).then(() => {
      if (cancelled) return;
      // Coalesce everything received during shrink, once. No animation restarts.
      setState(current => ({ ...current, phase: 'count', target: latest.current }));
    }).catch(() => {});
    return () => {
      cancelled = true; animations.forEach(animation => animation.cancel());
      el.dispatchEvent(new CustomEvent('reader-layout-end', { bubbles: true }));
    };
  }, [state.phase]);
  useEffect(() => {
    if (state.phase !== 'count' && state.phase !== 'settle' && state.phase !== 'reveal') return;
    const phase = state.phase;
    // Count visible presentation time, not a timer that can expire before a
    // busy browser paints. Each attention phase must get actual rendered frames.
    let elapsed = 0;
    let previous: number | undefined;
    let raf = 0;
    const tick = (now: number) => {
      if (previous !== undefined) elapsed += Math.min(40, now - previous);
      previous = now;
      if (elapsed < FOLD_TIMING[phase]) { raf = requestAnimationFrame(tick); return; }
      setState(current => {
        if (current.phase !== phase) return current;
        if (phase === 'count') return { ...current, phase: 'settle' };
        if (phase === 'settle') return { ...current, phase: 'reveal' };
        return idle(current.target);
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state.phase]);
  useLayoutEffect(() => {
    if (state.phase !== 'reveal' || !root.current) return;
    const el = root.current;
    el.dispatchEvent(new CustomEvent('reader-layout-start', { bubbles: true }));
    // Opacity alone still inserts the new layout in one frame. Open real space
    // first; text stays paused until this entry finishes, then catches up.
    const animations = Array.from(el.children).filter(child => !(child as HTMLElement).hidden && !state.beforeKeys.has((child as HTMLElement).dataset.flowKey!))
      .map(child => child.animate([
        { height: '0px', opacity: 0 },
        { height: `${child.getBoundingClientRect().height}px`, opacity: 1 },
      ], { duration: FOLD_TIMING.reveal, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' }));
    return () => {
      animations.forEach(animation => animation.cancel());
      el.dispatchEvent(new CustomEvent('reader-layout-end', { bubbles: true }));
    };
  }, [state.phase]);

  const blocked = state.phase === 'collapse' || state.phase === 'count' || state.phase === 'settle';
  const source = state.phase === 'idle' || state.phase === 'collapse' ? state.shown : state.target;
  const rows = state.phase === 'collapse' ? collapseRows(state.shown.items, state.target.items) : flowRows(source.items);
  return <FlowSnapshot.Provider value={source.snapshot}>
    <StreamMotionContext.Provider value={{ ...stream, paused: state.phase !== 'idle', resumed: state.phase === 'reveal' }}>
      <div id={id} ref={root} className={css.choreographedFlow} data-reader-flow data-reader-transition={state.phase} data-ud-motion="fold-choreography">
        {rows.map(row => {
          if (row.kind === 'summary') return <FlowCell key={row.key} rowKey={row.key} hidden={false} instant motion={motion} summary>
            <Summary item={row.item} open={processOpen && !!open[row.key]} onChange={value => onOpenChange(row.key, value)} motion={motion && state.phase !== 'collapse'} />
          </FlowCell>;
          const hidden = !!row.foldKey && (!processOpen || !open[row.foldKey]) || (blocked && state.phase !== 'collapse' && !state.beforeKeys.has(row.key));
          // Keep retiring child props unchanged until it has actually shrunk.
          return <FlowCell key={row.key} rowKey={row.key} hidden={hidden} instant={state.phase !== 'idle'} motion={motion}>
            {renderStep(row.step, !!row.foldKey)}
          </FlowCell>;
        })}
      </div>
    </StreamMotionContext.Provider>
  </FlowSnapshot.Provider>;
}
