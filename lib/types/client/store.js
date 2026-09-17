import { defineStore } from '@deepseek-ai/dsh-client-store';
export function createReaderStore() {
    return defineStore({
        init: () => ({ expanded: {}, motion: true, autoFold: true, processOnly: false }),
        persist: 'dsh.reader.v1',
        actions: {
            setExpanded: (draft, key, value) => { draft.expanded[key] = value; },
            setMotion: (draft, value) => { draft.motion = value; },
            setAutoFold: (draft, value) => { draft.autoFold = value; },
            setProcessOnly: (draft, value) => { draft.processOnly = value; },
        },
    });
}
//# sourceMappingURL=store.js.map