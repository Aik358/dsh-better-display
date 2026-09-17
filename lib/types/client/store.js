import { defineStore } from '@deepseek-ai/dsh-client-store';
export function createReaderStore() {
    return defineStore({
        init: () => ({ expanded: {}, motion: true, autoFold: true, deliverableOpenMode: 'external', processOnly: false }),
        persist: 'dsh.reader.v1',
        actions: {
            setExpanded: (draft, key, value) => { draft.expanded[key] = value; },
            setMotion: (draft, value) => { draft.motion = value; },
            setAutoFold: (draft, value) => { draft.autoFold = value; },
            setDeliverableOpenMode: (draft, value) => { draft.deliverableOpenMode = value; },
            setProcessOnly: (draft, value) => { draft.processOnly = value; },
        },
    });
}
//# sourceMappingURL=store.js.map