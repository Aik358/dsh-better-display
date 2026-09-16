import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { formatRunDuration } from './message-chrome.js';
import css from './Reader.module.css';
export function WaitingStatus({ anchor, label }) {
    // A new input gets its own clock even if the waiting indicator stays mounted.
    return _jsx(InputClock, { startTime: anchor.time, label: label }, anchor.key);
}
function InputClock({ startTime, label }) {
    const [mountedAt] = useState(() => Date.now());
    const [now, setNow] = useState(() => Date.now());
    const anchor = startTime ?? mountedAt;
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    return _jsxs("div", { className: css.turnStatus, role: "status", "aria-live": "polite", "data-reader-turn-status": true, "data-reader-wait-start": anchor, children: [_jsx("span", { className: css.turnStatusLabel, children: label }), _jsx("span", { className: css.turnStatusClock, "aria-hidden": "true", children: formatRunDuration(Math.max(0, now - anchor)) })] });
}
//# sourceMappingURL=WaitingStatus.js.map