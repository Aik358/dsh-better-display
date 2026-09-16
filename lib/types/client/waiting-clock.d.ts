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
/** Waiting is scoped to the latest human input, never the enclosing turn. */
export declare function waitingAnchor(order: readonly string[], get: (key: string) => InputNode | undefined, pending?: readonly Submission[]): WaitingAnchor;
export {};
//# sourceMappingURL=waiting-clock.d.ts.map