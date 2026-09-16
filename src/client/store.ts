import { defineStore } from '@deepseek-ai/dsh-client-store';
import type { EngineStoreHandle } from '@deepseek-ai/dsh-client-store';

export interface ReaderState { expanded: Record<string, boolean>; motion: boolean; autoFold: boolean }
type ReaderActions = {
  setExpanded: (draft: ReaderState, key: string, value: boolean) => void;
  setMotion: (draft: ReaderState, value: boolean) => void;
  setAutoFold: (draft: ReaderState, value: boolean) => void;
};

export function createReaderStore(): EngineStoreHandle<ReaderState, ReaderActions> {
  return defineStore({
    init: (): ReaderState => ({ expanded: {}, motion: true, autoFold: true }),
    persist: 'dsh.reader.v1',
    actions: {
      setExpanded: (draft, key: string, value: boolean) => { draft.expanded[key] = value; },
      setMotion: (draft, value: boolean) => { draft.motion = value; },
      setAutoFold: (draft, value: boolean) => { draft.autoFold = value; },
    },
  });
}
