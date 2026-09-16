const timestamp = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
/** Waiting is scoped to the latest human input, never the enclosing turn. */
export function waitingAnchor(order, get, pending = []) {
    let anchor = { key: 'unresolved', time: null };
    for (let i = order.length - 1; i >= 0; i--) {
        const node = get(order[i]);
        if (node?.kind === 'user' || node?.kind === 'steering') {
            const time = node.data && typeof node.data === 'object' && 'time' in node.data && typeof node.data.time === 'number' ? node.data.time : undefined;
            anchor = { key: order[i], time: timestamp(time) };
            break;
        }
    }
    for (let i = pending.length - 1; i >= 0; i--) {
        const input = pending[i];
        if (input.placement === 'queued')
            continue;
        const time = timestamp(input.time);
        if (time === null || anchor.time === null || time >= anchor.time)
            return { key: `pending:${input.requestId}`, time };
        break;
    }
    return anchor;
}
//# sourceMappingURL=waiting-clock.js.map