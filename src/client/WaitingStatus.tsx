import { useEffect, useState } from 'react';
import { formatRunDuration } from './message-chrome.js';
import type { WaitingAnchor } from './waiting-clock.js';
import css from './Reader.module.css';

export function WaitingStatus({ anchor, label }: { anchor: WaitingAnchor; label: string }) {
  // A new input gets its own clock even if the waiting indicator stays mounted.
  return <InputClock key={anchor.key} startTime={anchor.time} label={label} />;
}
function InputClock({ startTime, label }: { startTime: number | null; label: string }) {
  const [mountedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const anchor = startTime ?? mountedAt;
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <div className={css.turnStatus} role="status" aria-live="polite" data-reader-turn-status data-reader-wait-start={anchor}>
    <span className={css.turnStatusLabel}>{label}</span>
    <span className={css.turnStatusClock} aria-hidden="true">{formatRunDuration(Math.max(0, now - anchor))}</span>
  </div>;
}
