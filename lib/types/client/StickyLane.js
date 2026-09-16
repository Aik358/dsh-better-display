import { jsx as _jsx } from "react/jsx-runtime";
import { useLayoutEffect, useRef } from 'react';
/** Publish real lane geometry; wrapped labels must not collide with statistics. */
export function StickyLane({ kind, className, children }) {
    const ref = useRef(null);
    useLayoutEffect(() => {
        const el = ref.current;
        const scope = el?.closest(kind === 'toolbar' ? '[data-dsh-better-display]' : '[data-reader-turn]');
        if (!el || !scope)
            return;
        const property = kind === 'toolbar' ? '--reader-toolbar-height' : '--reader-status-height';
        const update = () => {
            scope.style.setProperty(property, `${el.getBoundingClientRect().height}px`);
            if (kind === 'toolbar')
                scope.style.setProperty('--reader-control-width', `${(el.querySelector('button')?.getBoundingClientRect().width ?? 80) + 20}px`);
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        const control = kind === 'toolbar' ? el.querySelector('button') : null;
        if (control)
            observer.observe(control);
        return () => { observer.disconnect(); scope.style.removeProperty(property); if (kind === 'toolbar')
            scope.style.removeProperty('--reader-control-width'); };
    }, [kind]);
    return _jsx("div", { ref: ref, className: className, "data-reader-lane": kind, "data-ud-check": kind === 'toolbar' ? 'reader-toolbar' : undefined, children: children });
}
//# sourceMappingURL=StickyLane.js.map