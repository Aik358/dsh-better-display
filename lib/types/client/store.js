import { defineStore } from '@deepseek-ai/dsh-client-store';
export function createReaderStore() {
    return defineStore({
        init: () => ({ expanded: {}, motion: true, autoFold: true }),
        persist: 'dsh.reader.v1',
        actions: {
            setExpanded: (draft, key, value) => { draft.expanded[key] = value; },
            setMotion: (draft, value) => { draft.motion = value; },
            setAutoFold: (draft, value) => { draft.autoFold = value; },
        },
    });
}
//# sourceMappingURL=store.js.map