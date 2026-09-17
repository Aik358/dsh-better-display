export interface WaitingAnchor {
    key: string;
    time: number | null;
}
type InputNode = {
    kind: string;
    data: unknown;
};
type Submission = {
    requestId: string;
    time: number;
    placement?: string;
};
/**
 * Node kinds that hand the turn back to the model: the user speaks, a tool
 * returns, context is injected, a command runs. The model is on the hook from
 * one of these, and can stall there; while a tool is running it is not.
 */
export declare const WAIT_AFTER: Set<string>;
/**
 * The moment the current wait began.
 *
 * This is the time of the **last** node that handed control to the model — a
 * returned tool, an injected context, or the user's own message. Anchoring on the
 * user's message alone made the readout count the entire turn, so a wait that had
 * only just begun showed the minutes the tools had already spent.
 */
export declare function waitingAnchor(order: readonly string[], get: (key: string) => InputNode | undefined, pending?: readonly Submission[]): WaitingAnchor;
export {};
//# sourceMappingURL=waiting-clock.d.ts.map