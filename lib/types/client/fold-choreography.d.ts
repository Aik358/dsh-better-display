import type { LiveStep, LiveTurnItem } from './live-turn.js';
/** Presentation clock, not model/network time. */
export declare const FOLD_TIMING: {
    readonly collapse: 320;
    readonly count: 160;
    readonly settle: 80;
    readonly reveal: 180;
};
export type FoldPhase = 'idle' | 'collapse' | 'count' | 'settle' | 'reveal';
export type FlowRow = {
    kind: 'summary';
    key: string;
    item: Extract<LiveTurnItem, {
        kind: 'fold';
    }>;
} | {
    kind: 'step';
    key: string;
    step: LiveStep;
    foldKey?: string;
};
/** A step always has the same parent and React key, even when its membership changes. */
export declare function flowRows(items: readonly LiveTurnItem[]): FlowRow[];
export declare function retiringKeys(before: readonly LiveTurnItem[], after: readonly LiveTurnItem[], open: Readonly<Record<string, boolean>>): string[];
/** Insert only new summary slots. Never admit incoming content during shrink. */
export declare function collapseRows(before: readonly LiveTurnItem[], target: readonly LiveTurnItem[]): FlowRow[];
export declare function containsNewUser(before: readonly LiveTurnItem[], after: readonly LiveTurnItem[]): boolean;
//# sourceMappingURL=fold-choreography.d.ts.map