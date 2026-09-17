export type DeliverableOpenMode = 'external' | 'sidebar';
export interface OpenModeSnapshot {
    getSnapshot: () => {
        deliverableOpenMode?: DeliverableOpenMode;
    };
    subscribe?: (fn: () => void) => () => void;
}
export declare function deliverableOpenModeOf(value: unknown): DeliverableOpenMode;
export declare function modeFromSnapshot(store: OpenModeSnapshot | undefined): DeliverableOpenMode;
export declare function isFolderOpenPath(path: string): boolean;
export declare function fileAddressFor(sessionId: string, cwd: string | undefined, path: string): string;
export declare function resolveOpenWorkspacePath(cwd: string | undefined, path: string, resolveWorkspacePath: (cwd: string | undefined, path: string) => string): string;
export declare function openDeliverableFile(args: {
    path: string;
    mode: DeliverableOpenMode;
    sessionId: string;
    cwd: string | undefined;
    resolveWorkspacePath: (cwd: string | undefined, path: string) => string;
    openExternal: (absolutePath: string) => Promise<void>;
    openSidebar?: (address: string) => void;
    fileAddressFor?: (sessionId: string, cwd: string | undefined, path: string) => string;
    warn?: (message: string, extra?: unknown) => void;
}): Promise<'sidebar' | 'external'>;
//# sourceMappingURL=open-file.d.ts.map
